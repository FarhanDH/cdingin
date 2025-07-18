import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { OtpRequest } from './dto/auth.request';
import { OtpToken } from './entities/otp-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OtpToken)
    private readonly otpTokenRepository: Repository<OtpToken>,
    private readonly userService: UserService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  /**
   * Sends an OTP to the given email address.
   *
   * @param request - The request body containing the email to which the OTP should be sent.
   * @returns A promise that resolves when the OTP has been successfully sent.
   */
  async sendOtp(request: OtpRequest) {
    this.logger.debug(`AuthService.sendOtp: ${JSON.stringify(request)}`);

    // Make sure that the changes to the database are atomic, so create a query runner and start a transaction.
    const connection = this.otpTokenRepository.manager.connection;
    const queryRunner = connection.createQueryRunner();

    // Connect to the database.
    await queryRunner.connect();

    // Start a transaction. Ensure that all the changes to the database are atomic, either all the changes are made or none of them are made.
    await queryRunner.startTransaction();

    try {
      // Get the user with the given email address. If the user does not exist, create a new user.
      let user = await this.userService.getByEmail(request.email);

      if (!user) {
        user = await queryRunner.manager.save(
          this.userService.createEmailEntity(request.email),
        );
      }

      // Generate a random OTP.
      const otp = this.generateOtp();

      // Create an OTP token entity with the given OTP, expiration time, and user.
      const otpToken = this.otpTokenRepository.create({
        otpCode: otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
        user,
      });

      // Save the OTP token to the database.
      await queryRunner.manager.save(otpToken);

      // Commit the transaction. This will make all the changes we made to the database permanent.
      await queryRunner.commitTransaction();

      // Return the OTP, email, and expiration time to the caller.
      return {
        otp: otpToken.otpCode,
        email: otpToken.user.email,
        expiresAt: 5,
      };
    } catch (error) {
      // If an error occurs, rollback the transaction. This will undo all the
      // changes made to the database.
      await queryRunner.rollbackTransaction();

      // Log the error.
      this.logger.error('Failed to send OTP', error.stack);

      // Throw an error to the caller.
      throw new Error('Failed to send OTP');
    } finally {
      // Release the query runner. This is important because it will free up any
      // resources that the query runner is using.
      await queryRunner.release();
    }
  }

  generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
