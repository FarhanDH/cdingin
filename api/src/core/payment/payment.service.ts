import {
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import midtransClient from 'midtrans-client';
import { DataSource, Repository } from 'typeorm';
import { configuration } from '~/common/configuration';
import { InvoiceStatus } from '~/common/enums/invoice.enum';
import { InvoiceService } from '../invoice/invoice.service';
import { Payment } from './entities/payment.entity';
import { MidtransTokenResponse } from './dto/payment.response';
import { NotificationService } from '../notification/notification.service';
import { Invoice } from '../invoice/entities/invoice.entity';
import { NotificationType } from '~/common/enums/notification-type.enum';
import { OrderStatusEnum } from '~/common/enums/order-status.enum';
import { PaymentMethod } from '~/common/enums/payment.enum';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly transactionRepository: Repository<Payment>,
        private readonly invoiceService: InvoiceService,
        private readonly notificationService: NotificationService,
        private readonly dataSource: DataSource,
    ) {}

    private readonly logger = new Logger(PaymentService.name);

    private readonly midtransSnap = new midtransClient.Snap({
        isProduction: false,
        serverKey: configuration().midtrans.serverKey,
    });

    /**
     * Creates a new Midtrans Snap transaction for a given invoice.
     * @param invoiceId - The ID of the invoice to be paid.
     * @param customerId - The ID of the customer making the payment.
     * @returns An object containing the Snap token for the frontend.
     */
    async createMidtransTransaction(
        invoiceId: string,
        customerId: string,
    ): Promise<MidtransTokenResponse> {
        const invoice = await this.invoiceService.getById(
            invoiceId,
            customerId,
        );

        if (!invoice) {
            throw new NotFoundException(
                'Invoice not found or does not belong to you.',
            );
        }
        if (invoice.status !== InvoiceStatus.UNPAID) {
            throw new ConflictException(
                'This invoice is not available for payment.',
            );
        }

        // Create a unique transaction ID
        const transactionId = `${invoice.id}-${Date.now()}`;

        const parameter = {
            transaction_details: {
                order_id: transactionId,
                gross_amount: invoice.total_amount,
            },
            customer_details: {
                first_name: invoice.order.customer.full_name,
                email: invoice.order.customer.email,
                phone: invoice.order.customer.phone_number,
            },
            item_details: invoice.items.map((item) => ({
                id: item.id.toString(),
                price: item.unit_price,
                quantity: item.quantity,
                name: item.description,
            })),
        };

        const snapToken = await this.midtransSnap.createTransaction(parameter);

        // Save the pending transaction to database
        const newTransaction = this.transactionRepository.create({
            id: transactionId,
            invoice: invoice,
            amount: invoice.total_amount,
        });
        await this.transactionRepository.save(newTransaction);

        return {
            token: snapToken.token,
            redirect_url: snapToken.redirect_url,
        };
    }

    /**
     * Confirms that an invoice has been paid with cash.
     * This action is performed by a technician.
     * This operation is transactional to ensure data integrity.
     * @param invoiceId - The ID of the invoice being confirmed.
     * @param technicianId - The ID of the technician confirming the payment.
     * @returns The updated invoice entity.
     */
    async confirmCashPayment(
        invoiceId: string,
        technicianId: string,
    ): Promise<Invoice> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Find the invoice and its related order, and lock them.
            const invoice = await queryRunner.manager.findOne(Invoice, {
                where: { id: invoiceId },
                relations: ['order', 'order.customer'],
                lock: { mode: 'pessimistic_write' },
            });

            if (!invoice) {
                throw new NotFoundException(
                    `Invoice with ID ${invoiceId} not found.`,
                );
            }

            // 2. Perform business logic validation.
            // Check if the invoice belongs to the technician
            if (invoice.order.technician.id !== technicianId) {
                throw new ForbiddenException(
                    'You are not authorized to confirm this payment.',
                );
            }
            if (invoice.status !== InvoiceStatus.UNPAID) {
                throw new ConflictException(
                    'This invoice is not awaiting payment.',
                );
            }
            if (invoice.order.status !== OrderStatusEnum.WAITING_PAYMENT) {
                throw new ConflictException(
                    'The associated order is not awaiting payment.',
                );
            }

            // 3. Update the invoice.
            invoice.status = InvoiceStatus.PAID;
            invoice.payment_method = PaymentMethod.CASH;
            invoice.paid_at = new Date();
            await queryRunner.manager.save(invoice);

            // 4. Update the order.
            const order = invoice.order;
            order.status = OrderStatusEnum.COMPLETED;
            await queryRunner.manager.save(order);

            // 5. Commit the transaction.
            await queryRunner.commitTransaction();

            // 6. Send notification to the customer (after transaction is committed).
            await this.notificationService.create({
                recipientId: order.customer.id,
                orderId: order.id,
                type: NotificationType.COMPLETED_ORDER,
                title: 'Pembayaran Lunas!',
                message: `Pembayaran tunai untuk pesanan #${order.id} telah diterima. Terima kasih!`,
            });

            return invoice;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(
                `Failed to confirm cash payment for invoice ${invoiceId}`,
                error,
            );
            throw new error.constructor(error.message); // Re-throw the original error
        } finally {
            await queryRunner.release();
        }
    }

    async handleMidtransWebhook(body: any) {
        return this.midtransSnap.handleWebhook(body);
    }
}
