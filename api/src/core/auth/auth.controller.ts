import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifyOtpRequest } from './dto/auth.request';
import { CreateCustomerProfileRequest } from '../user/dto/user.request';
import { Response } from 'express';
import { configuration } from '~/common/configuration';
import { ApiResponse } from '~/common/api-response.dto';
import { VerifyOtpResponse } from './dto/auth.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-otp')
  async verifyOtp(
    @Body() request: VerifyOtpRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiResponse<VerifyOtpResponse>> {
    const data = await this.authService.verifyOtp(request);

    // Set access token and refresh token in cookies
    response.cookie('accessToken', data.user.tokens.accessToken, {
      httpOnly: true,
      secure: configuration().env === 'production',
      sameSite: 'lax',
      maxAge: configuration().jwtConstants.accessTokenExpiresIn,
    });
    response.cookie('refreshToken', data.user.tokens.refreshToken, {
      httpOnly: true,
      secure: configuration().env === 'production',
      sameSite: 'lax',
      maxAge: configuration().jwtConstants.refreshTokenExpiresIn,
    });

    // Remove tokens from response
    data.user.tokens = undefined;

    return {
      message: 'OTP verified successfully',
      data,
    };
  }

  @Post('register-customer-profile')
  async createCustomerProfile(
    @Body() request: CreateCustomerProfileRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.registerCustomerProfile(request);

    // Set access token and refresh token in cookies
    response.cookie('accessToken', data.tokens.accessToken, {
      httpOnly: true,
      secure: configuration().env === 'production',
      sameSite: 'lax',
      maxAge: configuration().jwtConstants.accessTokenExpiresIn,
    });
    response.cookie('refreshToken', data.tokens.refreshToken, {
      httpOnly: true,
      secure: configuration().env === 'production',
      sameSite: 'lax',
      maxAge: configuration().jwtConstants.refreshTokenExpiresIn,
    });

    // Remove tokens from response
    data.tokens = undefined;

    return {
      message: 'OTP verified successfully',
      data,
    };
  }
}
