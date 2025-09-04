import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ApiResponse } from '~/common/api-response.dto';
import { NotificationResponse } from './dto/notification.response';
import { RequestWithUser } from '~/common/utils';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @UseGuards(JwtGuard)
    @Get()
    async getAllNotificationByUser(
        @Request() request: RequestWithUser,
    ): Promise<ApiResponse<NotificationResponse[]>> {
        const data = await this.notificationService.getAllNotificationByUser(
            request.user.sub,
        );

        return {
            message: 'Notification fetched successfully',
            data,
        };
    }
}
