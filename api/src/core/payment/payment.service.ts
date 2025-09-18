import { HttpService } from '@nestjs/axios';
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreApi, Snap } from 'midtrans-client';
import { DataSource, Repository } from 'typeorm';
import { configuration } from '~/common/configuration';
import { InvoiceStatus } from '~/common/enums/invoice.enum';
import { NotificationType } from '~/common/enums/notification-type.enum';
import { OrderStatusEnum } from '~/common/enums/order-status.enum';
import { PaymentStatus } from '~/common/enums/payment-status.enum';
import { PaymentMethod } from '~/common/enums/payment.enum';
import { Invoice } from '../invoice/entities/invoice.entity';
import { InvoiceService } from '../invoice/invoice.service';
import { NotificationService } from '../notification/notification.service';
import { OrderResponse, toOrderResponse } from '../order/dto/order.response';
import { Order } from '../order/entities/order.entity';
import { PushSubscriptionService } from '../push-subscription/push-subscription.service';
import { MidtransTokenResponse } from './dto/payment.response';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        private readonly httpService: HttpService,
        private readonly invoiceService: InvoiceService,
        private readonly pushSubscriptionService: PushSubscriptionService,
        private readonly notificationService: NotificationService,
        private readonly dataSource: DataSource,
    ) {}

    private readonly logger = new Logger(PaymentService.name);

    private readonly midtransSnap: Snap = new Snap({
        isProduction: false,
        serverKey: configuration().midtrans.serverKey,
        clientKey: configuration().midtrans.clientKey,
    });

    private readonly midtransCoreApi = new CoreApi({
        isProduction: false,
        serverKey: configuration().midtrans.serverKey,
        clientKey: configuration().midtrans.clientKey,
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
        const invoice = await this.invoiceService.getByIdWithUserId(
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
        const newTransaction = this.paymentRepository.create({
            id: transactionId,
            invoice: invoice,
            amount: invoice.total_amount,
            status: PaymentStatus.PENDING,
        });
        await this.paymentRepository.save(newTransaction);

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
    ): Promise<OrderResponse> {
        this.logger.log(`Confirming cash payment for invoice ${invoiceId}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Find the invoice and its related order, and lock them.
            const invoice = await queryRunner.manager.findOne(Invoice, {
                where: { id: invoiceId },
                relations: [
                    'order',
                    'order.technician',
                    'order.customer',
                    'order.ac_units',
                ],
                // lock: { mode: 'pessimistic_write' },
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

            // 4. Update the payment.
            let payment = await queryRunner.manager.findOne(Payment, {
                where: { invoice: { id: invoiceId } },
                // lock: { mode: 'pessimistic_write' },
            });

            if (!payment) {
                const paymentId = `${invoice.id}-cash-${Date.now()}`;

                // Create a new payment record if not found
                payment = queryRunner.manager.create(Payment, {
                    id: paymentId,
                    invoice: invoice,
                    amount: invoice.total_amount,
                    status: PaymentStatus.SUCCESS,
                    method: PaymentMethod.CASH,
                });
            } else {
                payment.method = PaymentMethod.CASH;
                payment.status = PaymentStatus.SUCCESS;
                payment.amount = invoice.total_amount;
            }

            await queryRunner.manager.save(payment);

            // 3. Update the invoice.
            invoice.status = InvoiceStatus.PAID;
            invoice.paid_at = new Date();
            await queryRunner.manager.save(invoice);

            // 4. Update the order.
            const order = invoice.order;
            order.status = OrderStatusEnum.COMPLETED;
            queryRunner.manager.create(Order, order);
            await queryRunner.manager.save(order);

            //   Send notification to the customer (after transaction is committed).
            const notification = await this.notificationService.create({
                recipientId: order.customer.id,
                orderId: order.id,
                type: NotificationType.COMPLETED_ORDER,
                title: 'Yeay! Pembayaran Lunas!',
                message: `Pembayaran tunai telah diterima. Terima kasih!`,
            });

            await this.pushSubscriptionService.sendNotificationToUser(
                notification.recipient.id,
                {
                    title: notification.title,
                    body: notification.message,
                    tag: notification.type,
                    link: '/notifications',
                },
            );
            // Commit the transaction.
            await queryRunner.commitTransaction();

            return toOrderResponse(invoice.order);
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

    /**
     * Handles incoming webhook notifications from Midtrans.
     * Verifies the notification and updates the transaction, invoice, and order statuses accordingly.
     * This operation is transactional and idempotent.
     * @param notificationPayload - The full notification body from Midtrans.
     */
    async handleMidtransWebhook(notificationPayload: any): Promise<void> {
        this.logger.debug(
            `Received Midtrans webhook: ${JSON.stringify(notificationPayload)}`,
        );

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Verify the notification
            const { data: midtransResponse } =
                await this.httpService.axiosRef.get(
                    `${configuration().midtrans.url}/${notificationPayload.transaction_id}/status`,
                    {
                        headers: {
                            accept: 'application/json',
                            authorization: `Basic ${Buffer.from(`${configuration().midtrans.username}:${configuration().midtrans.password}`).toString('base64')}`,
                        },
                    },
                );

            const transactionId = midtransResponse.order_id;
            const transactionStatus = midtransResponse.transaction_status;
            const fraudStatus = midtransResponse.fraud_status;

            // 2. Find the corresponding transaction in our database and lock it.
            const transaction = await queryRunner.manager.findOne(Payment, {
                where: { id: transactionId },
                relations: [
                    'invoice',
                    'invoice.order',
                    'invoice.order.customer',
                    'invoice.order.technician',
                ],
                // lock: { mode: 'pessimistic_write' },
            });

            if (!transaction) {
                // This can happen if Midtrans sends a notification for a transaction we don't know about.
                // It's safe to ignore, but good to log.
                this.logger.warn(
                    `Webhook received for unknown transaction ID: ${transactionId}`,
                );
                await queryRunner.commitTransaction(); // Commit to end the transaction.
                return;
            }

            // 3. Idempotency Check: If the transaction is already settled, do nothing.
            if (transaction.status === PaymentStatus.SETTLEMENT) {
                this.logger.log(
                    `Transaction ${transactionId} is already settled. Ignoring webhook.`,
                );
                await queryRunner.commitTransaction();
                return;
            }

            // 4. Update our transaction record with the latest status from Midtrans.
            let newStatus: PaymentStatus;
            if (
                transactionStatus == 'capture' ||
                transactionStatus == 'settlement'
            ) {
                if (fraudStatus == 'accept') {
                    newStatus = PaymentStatus.SETTLEMENT;
                }
            } else if (
                transactionStatus == 'cancel' ||
                transactionStatus == 'deny' ||
                transactionStatus == 'expire'
            ) {
                newStatus = PaymentStatus.CANCEL; // Or map to more specific statuses
            } else if (transactionStatus == 'pending') {
                newStatus = PaymentStatus.PENDING;
            }

            if (newStatus) {
                transaction.status = newStatus;
                transaction.method = PaymentMethod.MIDTRANS;
                transaction.gateway_response = midtransResponse; // Store the full response for auditing
                await queryRunner.manager.save(transaction);
            }

            // 5. If payment is successful, update the invoice and order.
            if (newStatus === PaymentStatus.SETTLEMENT) {
                const invoice = transaction.invoice;
                invoice.status = InvoiceStatus.PAID;
                transaction.method = PaymentMethod.MIDTRANS;
                invoice.paid_at = new Date();

                const order = invoice.order;
                order.status = OrderStatusEnum.COMPLETED;

                await queryRunner.manager.save(invoice);
                await queryRunner.manager.save(order);

                // Notify the customer
                const customerNotification =
                    await this.notificationService.create({
                        recipientId: order.customer.id,
                        orderId: order.id,
                        type: NotificationType.PAYMENT_SUCCESS,
                        title: 'Yeay! Pembayaran berhasil!',
                        message: `Cihuuy, pembayaran berhasil. Makasih dan semoga AC-nya tetap adem.`,
                    });

                // Notify the technician
                const technicianNotification =
                    await this.notificationService.create({
                        recipientId: order.technician.id,
                        orderId: order.id,
                        type: NotificationType.PAYMENT_SUCCESS,
                        title: 'Pelanggan Udah Bayar',
                        message: `Pembayaran untuk pesanan #${order.id} dilakukan lewat Midtrans.`,
                    });

                // Send notifications to technician
                await this.pushSubscriptionService.sendNotificationToUser(
                    technicianNotification.recipient.id,
                    {
                        title: technicianNotification.title,
                        body: technicianNotification.message,
                        tag: technicianNotification.type,
                        link: '/technician/notifications',
                    },
                );

                // Send notifications to customer
                await this.pushSubscriptionService.sendNotificationToUser(
                    customerNotification.recipient.id,
                    {
                        title: customerNotification.title,
                        body: customerNotification.message,
                        tag: customerNotification.type,
                        link: '/notifications',
                    },
                );
                // Commit the transaction BEFORE sending notifications.
                await queryRunner.commitTransaction();
            } else {
                // If the status is not settlement, just commit the transaction status update.
                await queryRunner.commitTransaction();
            }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Error handling Midtrans webhook:', error);
            // Do not throw an error back to Midtrans, as it might cause repeated retries.
            // Log it internally for investigation.
        } finally {
            await queryRunner.release();
        }
    }
}
