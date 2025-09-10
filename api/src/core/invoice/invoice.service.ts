import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InvoiceStatus } from '~/common/enums/invoice.enum';
import { NotificationType } from '~/common/enums/notification-type.enum';
import { OrderStatusEnum } from '~/common/enums/order-status.enum';
import { NotificationService } from '../notification/notification.service';
import { Order } from '../order/entities/order.entity';
import { OrderService } from '../order/order.service';
import { PushSubscriptionService } from '../push-subscription/push-subscription.service';
import { CreateInvoiceDto } from './dto/invoice.request';
import {
    InvoiceResponseDto,
    toInvoiceResponseDto,
} from './dto/invoice.response';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,

        private readonly dataSource: DataSource,
        private readonly pushSubscriptionService: PushSubscriptionService,
        private readonly orderService: OrderService,
        private readonly notificationService: NotificationService,
    ) {}

    private readonly logger = new Logger(InvoiceService.name);

    /**
     * Creates a new invoice for a completed order.
     * This operation is transactional.
     * @param orderId - The ID of the order to create an invoice for.
     * @param createInvoiceDto - The invoice data.
     * @returns The newly created invoice entity.
     */
    async create(
        orderId: string,
        createInvoiceDto: CreateInvoiceDto,
    ): Promise<InvoiceResponseDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Find the order and lock it for update to prevent race conditions.
            const order = await queryRunner.manager.findOne(Order, {
                where: { id: orderId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!order) {
                throw new NotFoundException(
                    `Order with ID ${orderId} not found.`,
                );
            }

            const existingInvoice = await queryRunner.manager.findOne(Invoice, {
                where: { order: { id: orderId } },
                relations: {
                    order: {
                        customer: true,
                    },
                },
            });

            if (existingInvoice) {
                throw new ConflictException(
                    'An invoice for this order already exists.',
                );
            }

            if (order.status !== OrderStatusEnum.ON_WORKING) {
                throw new ConflictException(
                    'Invoice can only be created for orders that are "on working".',
                );
            }

            // Calculate total amount and prepare invoice items.
            let totalAmount = 0;
            const invoiceItemsToSave = createInvoiceDto.items.map((itemDto) => {
                const totalPrice = itemDto.quantity * itemDto.unitPrice;
                totalAmount += totalPrice;
                return queryRunner.manager.create(InvoiceItem, {
                    description: itemDto.description,
                    quantity: itemDto.quantity,
                    unit_price: itemDto.unitPrice,
                    total_price: totalPrice,
                });
            });

            // Create the main invoice entity.
            const newInvoice = queryRunner.manager.create(Invoice, {
                order: order,
                invoice_number: `INV/${new Date().getFullYear()}/${orderId.slice(-6)}`,
                status: InvoiceStatus.UNPAID,
                total_amount: totalAmount,
                issued_at: new Date(),
                items: invoiceItemsToSave,
            });

            const savedInvoice = await queryRunner.manager.save(newInvoice);

            order.status = OrderStatusEnum.WAITING_PAYMENT;
            await queryRunner.manager.save(order);

            const updatedOrder = await this.orderService.getById(orderId);

            const notification = await this.notificationService.create({
                recipientId: updatedOrder.customer.id,
                orderId: updatedOrder.id,
                type: NotificationType.INVOICE_CREATED,
                title: 'Tagihanmu udah siap!',
                message: `Tagihan untuk pesanan ${order.id} sudah tersedia. Yuk, bayar sekarang!`,
            });

            // Commit the transaction.
            await queryRunner.commitTransaction();

            await this.pushSubscriptionService.sendNotificationToUser(
                updatedOrder.customer.id,
                {
                    title: notification.title,
                    body: notification.message,
                    tag: notification.type,
                },
            );

            return toInvoiceResponseDto(savedInvoice);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(
                `Failed to create invoice for order ${orderId}`,
                error,
            );
            throw new error.constructor(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async getById(id: string, userId: string): Promise<Invoice> {
        const data = await this.invoiceRepository.findOne({
            where: { id, order: { customer: { id: userId } } },
            relations: {
                order: {
                    customer: true,
                },
                items: true,
            },
        });

        if (!data) {
            throw new NotFoundException(`Invoice with ID ${id} not found.`);
        }

        return data;
    }
}
