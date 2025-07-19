import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifyOtpRequest } from './dto/auth.request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-otp')
  async verifyOtp(@Body() request: VerifyOtpRequest) {
    return await this.authService.verifyOtp(request);
  }
}
