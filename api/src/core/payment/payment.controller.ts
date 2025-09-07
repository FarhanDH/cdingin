import { Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Roles } from '~/common/decorators/roles.decorator';
import { RoleEnum } from '~/common/enums/role.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiResponse } from '~/common/api-response.dto';
import { RequestWithUser } from '~/common/utils';
import { MidtransTokenResponse } from './dto/payment.response';
import { Invoice } from '../invoice/entities/invoice.entity';

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
    @Post(':invoiceId/confirm-cash-payment')
    async confirmCashPayment(
        @Param('invoiceId') invoiceId: string,
        @Request() req: RequestWithUser,
    ): Promise<ApiResponse<Invoice>> {
        const data = await this.paymentService.confirmCashPayment(
            invoiceId,
            req.user.sub,
        );

        return {
            message: 'Cash payment confirmed successfully.',
            data,
        };
    }
}
