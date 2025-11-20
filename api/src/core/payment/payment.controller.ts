import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '~/common/api-response.dto';
import { Roles } from '~/common/decorators/roles.decorator';
import { RoleEnum } from '~/common/enums/role.enum';
import { RequestWithUser } from '~/common/utils';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrderResponse } from '../order/dto/order.response';
import { MidtransTokenResponse } from './dto/payment.response';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    /**
     * Endpoint for a customer to initiate a payment via Midtrans.
     * Returns a Snap token for the frontend.
     */
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(RoleEnum.CUSTOMER)
    @Post('/invoices/:invoiceId/midtrans')
    async createMidtransPayment(
        @Param('invoiceId') invoiceId: string,
        @Request() req: RequestWithUser,
    ): Promise<ApiResponse<MidtransTokenResponse>> {
        const customerId = req.user.sub;
        const data = await this.paymentService.createMidtransTransaction(
            invoiceId,
            customerId,
        );
        return {
            message: 'Midtrans transaction initiated successfully.',
            data,
        };
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(RoleEnum.TECHNICIAN)
    @Post('/invoices/:invoiceId/confirm-cash-payment')
    async confirmCashPayment(
        @Param('invoiceId') invoiceId: string,
        @Request() req: RequestWithUser,
    ): Promise<ApiResponse<OrderResponse>> {
        const data = await this.paymentService.confirmCashPayment(
            invoiceId,
            req.user,
        );

        return {
            message: 'Cash payment confirmed successfully.',
            data,
        };
    }

    /**
     * Public endpoint to receive webhook notifications from Midtrans.
     * No authentication guards are used here as the request comes from Midtrans servers.
     * Security is handled by verifying the notification signature.
     */
    @Post('midtrans-webhook')
    @HttpCode(HttpStatus.OK)
    async handleMidtransWebhook(@Body() body: any) {
        // We don't need to return anything in the response body.
        // The service handles all logic asynchronously.
        return await this.paymentService.handleMidtransWebhook(body);
    }
}
