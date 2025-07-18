import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('ping')
  @Render('otp')
  getHello() {
    return {
      otpValue: '123',
      expiresAt: 5,
    };
  }
}
