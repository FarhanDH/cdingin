import { HttpService } from '@nestjs/axios';
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Snap } from 'midtrans-client';
import { DataSource, Repository } from 'typeorm';
import { configuration } from '~/common/configuration';
import { InvoiceStatus } from '~/common/enums/invoice.enum';
import { NotificationType } from '~/common/enums/notification-type.enum';
import { OrderStatusEnum } from '~/common/enums/order-status.enum';
import { PaymentStatus } from '~/common/enums/payment-status.enum';
import { PaymentMethod } from '~/common/enums/payment.enum';
import { JwtPayload } from '../auth/dto/auth.response';
import { formatPaymentString } from '../invoice/dto/invoice.response';
import { Invoice } from '../invoice/entities/invoice.entity';
import { InvoiceService } from '../invoice/invoice.service';
import { NotificationService } from '../notification/notification.service';
import { OrderResponse } from '../order/dto/order.response';
import { Order } from '../order/entities/order.entity';
import { OrderService } from '../order/order.service';
import {
    PayloadMessage,
    PushSubscriptionService,
} from '../push-subscription/push-subscription.service';
import { PusherService } from '../pusher/pusher.service';
import {
    CreateCoreApiPaymentRequestDto,
    SupportedPaymentMethod,
} from './dto/payment.request';
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
        private readonly pusherService: PusherService,
        private readonly orderService: OrderService,
    ) {}

    private readonly logger = new Logger(PaymentService.name);

    private readonly midtransSnap: Snap = new Snap({
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
    async createSnapMidtransTransaction(
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

    async createCoreApiTransaction(
        invoiceId: string,
        customerId: string,
        dto: CreateCoreApiPaymentRequestDto,
    ): Promise<Payment> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const invoice = await queryRunner.manager.findOne(Invoice, {
                where: {
                    id: invoiceId,
                    order: { customer: { id: customerId } },
                },
                relations: ['order', 'order.customer'],
            });
            console.log(invoice);

            if (!invoice) {
                throw new NotFoundException('Invoice not found.');
            }

            if (invoice.status !== InvoiceStatus.UNPAID) {
                throw new ConflictException(
                    'Invoice is already paid or expired.',
                );
            }

            const transactionId = `${invoice.id}-${Date.now()}`;

            // Determine the payment type based on the payment method
            let paymentType: string;
            if (dto.paymentMethod === SupportedPaymentMethod.QRIS) {
                paymentType = 'qris';
            } else if (dto.paymentMethod === SupportedPaymentMethod.MANDIRI) {
                paymentType = 'echannel';
            } else {
                paymentType = 'bank_transfer';
            }

            let midtransPayload: any = {
                payment_type: paymentType,
                transaction_details: {
                    order_id: transactionId,
                    gross_amount: invoice.total_amount,
                },
                customer_details: {
                    first_name: invoice.order.customer.full_name,
                    email: invoice.order.customer.email,
                    phone: invoice.order.customer.phone_number,
                },
            };

            if (dto.paymentMethod === SupportedPaymentMethod.QRIS) {
                midtransPayload.qris = {
                    acquirer: 'gopay',
                };
                midtransPayload.expiry = {
                    unit: 'minutes',
                    expiry_duration: 15,
                };
            } else if (
                [
                    SupportedPaymentMethod.BCA,
                    SupportedPaymentMethod.BNI,
                    SupportedPaymentMethod.BRI,
                    SupportedPaymentMethod.PERMATA,
                ].includes(dto.paymentMethod)
            ) {
                midtransPayload.bank_transfer = {
                    bank: dto.paymentMethod,
                };
                midtransPayload.expiry = {
                    unit: 'minutes',
                    expiry_duration: 120,
                };
            } else {
                midtransPayload.echannel = {
                    bill_info1: 'Payment For:',
                    bill_info2: 'Service AC Invoice',
                };
                midtransPayload.expiry = {
                    unit: 'minutes',
                    expiry_duration: 120,
                };
            }

            console.log('midtransPayload: ', midtransPayload);

            const { data: midtransResponse } =
                await this.httpService.axiosRef.post(
                    configuration().midtrans.coreUrl,
                    midtransPayload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            Authorization: `Basic ${Buffer.from(
                                `${configuration().midtrans.serverKey}:`,
                            ).toString('base64')}`,
                        },
                    },
                );

            let expiryTimeString = midtransResponse.expiry_time;
            if (
                !expiryTimeString.includes('+') &&
                !expiryTimeString.includes('Z')
            ) {
                expiryTimeString = `${expiryTimeString} +0800`;
            }
            console.log('midtransResponse: ', midtransResponse);

            // Hapus pembayaran PENDING sebelumnya jika ada
            await queryRunner.manager.delete(Payment, {
                invoice: { id: invoice.id },
                status: PaymentStatus.PENDING,
            });

            const newPayment = queryRunner.manager.create(Payment, {
                id: transactionId,
                invoice: invoice,
                amount: invoice.total_amount,
                status: PaymentStatus.PENDING,
                method: PaymentMethod.MIDTRANS,
                gateway_response: midtransResponse,
                expiry_time: new Date(expiryTimeString),
                actions: midtransResponse.actions,
            });

            if (dto.paymentMethod === SupportedPaymentMethod.QRIS) {
                newPayment.qr_code_url = midtransResponse.qr_string;
            } else if (dto.paymentMethod === SupportedPaymentMethod.MANDIRI) {
                newPayment.bank = SupportedPaymentMethod.MANDIRI;
            } else if (dto.paymentMethod === SupportedPaymentMethod.PERMATA) {
                newPayment.bank = SupportedPaymentMethod.PERMATA;
                newPayment.va_number = midtransResponse.permata_va_number;
            } else {
                const vaAccount = midtransResponse.va_numbers[0];
                newPayment.bank = vaAccount.bank;
                newPayment.va_number = vaAccount.va_number;
            }

            const savedPayment = await queryRunner.manager.save(newPayment);

            await queryRunner.commitTransaction();

            // Send notifications to customer
            const expiryTime = Math.floor(
                (newPayment.expiry_time.getTime() - Date.now()) / (1000 * 60),
            );
            const payloadMessageNotification: PayloadMessage = {
                title: newPayment.qr_code_url
                    ? 'Selesaikan pembayaran QRIS sekarang, ya'
                    : 'Selesaikan pembayaran VA sekarang, ya',
                tag: NotificationType.PAYMENT_CREATED,
                body: newPayment.qr_code_url
                    ? `QRIS-nya berlaku selama ${expiryTime} menit. Silakan lakukan pembayaran pakai e-wallet atau mobile banking yang anda punya.`
                    : `Nomor VA-nya berlaku selama ${expiryTime} jam. Silakan transfer Rp${Number(
                          newPayment.amount,
                      ).toLocaleString(
                          'id-ID',
                      )} ke ${newPayment.bank.toUpperCase()} Virtual Account.`,
                link: `/order/${invoice.order.id}/payment/${newPayment.id}`,
                userId: customerId,
            };
            await this.pushSubscriptionService.sendNotificationToUser(
                customerId,
                payloadMessageNotification,
            );

            return savedPayment;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(
                `Failed to create Core API transaction for invoice ${invoiceId}: ${JSON.stringify(error.response?.data) || error.message}`,
            );
            throw new (error.constructor || Error)(
                error.response?.data?.status_message ||
                    error.message ||
                    'Failed to create payment.',
            );
        } finally {
            await queryRunner.release();
        }
    }

    async getPaymentDetails(
        paymentId: string,
        customerId: string,
    ): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: {
                id: paymentId,
                invoice: { order: { customer: { id: customerId } } },
            },
            relations: ['invoice', 'invoice.order'],
        });

        if (!payment) {
            this.logger.warn(
                `Payment with ID ${paymentId} not found for customer ${customerId}`,
            );
            throw new NotFoundException(
                'Detail pembayaran tidak ditemukan atau Anda tidak memiliki akses.',
            );
        }

        return payment;
    }

    async confirmCashPayment(
        invoiceId: string,
        user: JwtPayload,
    ): Promise<OrderResponse> {
        this.logger.log(`Confirming cash payment for invoice ${invoiceId}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            //ind the invoice and its related order, and lock them.
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

            // Perform business logic validation.
            // Check if the invoice belongs to the technician
            if (invoice.order.technician.id !== user.sub) {
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

            // Update the payment.
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

            // Update the invoice.
            invoice.status = InvoiceStatus.PAID;
            invoice.paid_at = new Date();
            await queryRunner.manager.save(invoice);

            // Update the order.
            const order = invoice.order;
            order.status = OrderStatusEnum.COMPLETED;
            queryRunner.manager.create(Order, order);
            await queryRunner.manager.save(order);

            // Commit the transaction BEFORE sending notifications.
            await queryRunner.commitTransaction();

            // --- Send notifications AFTER the transaction is successfully committed ---
            try {
                const notification = await this.notificationService.create({
                    recipientId: order.customer.id,
                    orderId: order.id,
                    type: NotificationType.COMPLETED_ORDER,
                    title: 'Mantap, Pembayaran Lunas! 🎉',
                    message: `Pembayaran tunaimu udah diterima teknisi. Makasih banyak, ya!`,
                });

                // Trigger REAL-TIME UPDATE for the customer's page
                const channelName = `order-${order.id}-customer`;
                await this.pusherService.trigger(
                    channelName,
                    'status-updated-customer',
                    {
                        orderId: order.id,
                        newStatus: order.status, // Use the actual final status
                        message: notification.title,
                    },
                );

                // Send Push Notification
                await this.pushSubscriptionService.sendNotificationToUser(
                    notification.recipient.id,
                    {
                        title: notification.title,
                        body: notification.message,
                        tag: notification.type,
                        link: '/notifications',
                    },
                );
            } catch (notificationError) {
                this.logger.error(
                    `Failed to send notifications for order ${order.id} after cash payment confirmation`,
                    notificationError,
                );
                // Do not throw an error here, as the core payment logic was successful.
            }

            return await this.orderService.getOneByIdForTechnician(
                user,
                order.id,
            );
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
                    `${configuration().midtrans.snapUrl}/${notificationPayload.transaction_id}/status`,
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
                        message: `Cihuuy, pembayaran berhasil. Makasih, ya! Semoga AC-nya tetap adem.`,
                    });

                // Notify the technician
                const technicianNotification =
                    await this.notificationService.create({
                        recipientId: order.technician.id,
                        orderId: order.id,
                        type: NotificationType.PAYMENT_SUCCESS,
                        title: 'Pelanggan Udah Bayar',
                        message: `Mantap! Pelanggan udah bayar orderan #${order.id} dilakukan lewat ${formatPaymentString(
                            (
                                transaction.gateway_response as {
                                    payment_type: string;
                                }
                            )?.payment_type,
                        )}.`,
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

                // Trigger REAL-TIME UPDATE for the technician's page
                const channelName = `order-${order.id}-technician`;
                await this.pusherService.trigger(
                    channelName,
                    'status-updated-technician',
                    {
                        orderId: order.id,
                        newStatus: order.status,
                        message: technicianNotification.title,
                    },
                );

                const customerChannelName = `order-${order.id}-customer`;
                await this.pusherService.trigger(
                    customerChannelName,
                    'payment-updated',
                    {
                        orderId: order.id,
                        paymentId: transaction.id,
                        newStatus: newStatus,
                        message: customerNotification.title,
                    },
                );
            } else {
                // If status is not settlement (e.g., expire, cancel), still notify the customer page to refetch.
                const order = transaction.invoice.order;
                const customerChannelName = `order-${order.id}-customer`;
                await this.pusherService.trigger(
                    customerChannelName,
                    'payment-updated', // Use a specific event for payment
                    {
                        orderId: order.id,
                        paymentId: transaction.id,
                        newStatus: newStatus,
                        message: 'Pembayaran gagal.',
                    },
                );

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
