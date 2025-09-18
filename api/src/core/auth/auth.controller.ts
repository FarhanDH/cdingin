import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifyOtpRequest } from './dto/auth.request';
import { CreateCustomerProfileRequest } from '../user/dto/user.request';
import { CookieOptions, Response } from 'express';
import { configuration } from '~/common/configuration';
import { ApiResponse } from '~/common/api-response.dto';
import { VerifyOtpResponse } from './dto/auth.response';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    private setTokenCookies(
        response: Response,
        tokens: { accessToken: string; refreshToken: string },
    ) {
        const isProduction = configuration().env === 'production';

        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
        };

        // if (!isProduction) {
        //     cookieOptions.domain = '.localhost';
        // } else if (configuration().domain) {
        //     cookieOptions.domain = configuration().domain;
        // }

        response.cookie('accessToken', tokens.accessToken, {
            ...cookieOptions,
            maxAge: configuration().jwtConstants.accessTokenExpiresIn * 1000,
        });
        response.cookie('refreshToken', tokens.refreshToken, {
            ...cookieOptions,
            maxAge: configuration().jwtConstants.refreshTokenExpiresIn * 1000,
        });
    }

    @Post('verify-otp')
    async verifyOtp(
        @Body() request: VerifyOtpRequest,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ApiResponse<VerifyOtpResponse>> {
        const data = await this.authService.verifyOtp(request);

        if (data.user?.tokens) {
            this.setTokenCookies(response, data.user.tokens);
            data.user.tokens = undefined;
        }

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

        this.setTokenCookies(response, data.tokens);
        data.tokens = undefined;

        return {
            message: 'Customer profile created successfully',
            data,
        };
    }
}
