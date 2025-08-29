import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { PushSubscriptionService } from './push-subscription.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RequestWithUser } from '~/common/utils';
import { CreatePushSubscriptionRequest } from './dto/push-subscription.request';

@Controller('push-subscription')
export class PushSubscriptionController {
    constructor(
        private readonly pushSubscriptionService: PushSubscriptionService,
    ) {}

    @Post()
    @UseGuards(JwtGuard)
    async create(
        @Request() req: RequestWithUser,
        @Body() subscriptionDto: CreatePushSubscriptionRequest,
    ) {
        return await this.pushSubscriptionService.create(
            req.user,
            subscriptionDto,
        );
    }
}
