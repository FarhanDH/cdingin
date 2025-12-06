import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Query,
    UseGuards,
} from '@nestjs/common';
import { GeocodingService } from './geocoding.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('geocoding')
export class GeocodingController {
    constructor(private readonly geocodingService: GeocodingService) {}

    @UseGuards(JwtGuard)
    @Get('reverse')
    async reverseGeocode(@Query('lat') lat: number, @Query('lon') lon: number) {
        try {
            return await this.geocodingService.reverseGeocode(lat, lon);
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }
}
