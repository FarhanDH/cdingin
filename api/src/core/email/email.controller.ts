import { Body, Controller, Post } from '@nestjs/common';
import { OtpRequest } from '../auth/dto/auth.request';
import { AuthService } from '../auth/auth.service';
import { EmailService } from './email.service';
import { ApiResponse } from '~/common/api-response.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-otp')
  /**
   * Handles the HTTP POST request to send an OTP to the given email address.
   *
   * @param request - The request body containing the email to which the OTP should be sent.
   * @returns A promise that resolves when the OTP has been successfully sent.
   */
  async sendOtp(@Body() request: OtpRequest): Promise<ApiResponse<string>> {
    const result = await this.emailService.sendOtp(request);

    return {
      message: result.message,
    };
  }
}
