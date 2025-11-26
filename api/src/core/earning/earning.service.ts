import { Injectable, Logger } from '@nestjs/common';
import { EarningResponse } from './dto/earning.response';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../order/entities/order.entity';
import { Repository } from 'typeorm/repository/Repository';
import { OrderStatusEnum } from '~/common/enums/order-status.enum';
import { InvoiceStatus } from '~/common/enums/invoice.enum';
import { PaymentMethod } from '~/common/enums/payment.enum';
import { PaymentStatus } from '~/common/enums/payment-status.enum';
import { Not } from 'typeorm';

@Injectable()
export class EarningService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) {}
    private readonly logger: Logger = new Logger(EarningService.name);

    async getSummaryByDate(
        date: Date,
        technicianId: string,
    ): Promise<EarningResponse> {
        this.logger.debug(
            `EarningService.getSummaryByDate(${date}, ${technicianId})`,
        );

        const orders = await this.orderRepository.find({
            where: {
                technician: {
                    id: technicianId,
                },
                service_date: date,
            },
            relations: {
                invoice: {
                    payment: true,
                },
            },
        });

        const pendingOrders = await this.getPendingOrdersByDate(date);

        return {
            orderTotal: orders.length + pendingOrders.length,
            earningTotal: orders.reduce((total, order) => {
                if (order.invoice?.status === InvoiceStatus.PAID) {
                    return total + Number(order.invoice.total_amount);
                }
                return total;
            }, 0),
            cashPaymentTotal: orders.reduce((total, order) => {
                const payment = order.invoice?.payment;
                if (
                    payment &&
                    payment.method === PaymentMethod.CASH &&
                    payment.status === PaymentStatus.SUCCESS
                ) {
                    return total + Number(payment.amount);
                }
                return total;
            }, 0),
            cancelledOrderCount: orders.filter(
                (order) => order.status === OrderStatusEnum.CANCELLED,
            ).length,
            completedOrderCount: orders.filter(
                (order) => order.status === OrderStatusEnum.COMPLETED,
            ).length,
            missedOrderCount:
                orders.filter(
                    (order) =>
                        order.status !== OrderStatusEnum.CANCELLED &&
                        order.status !== OrderStatusEnum.COMPLETED,
                ).length + pendingOrders.length,
            digitalPaymentTotal: orders.reduce((total, order) => {
                const payment = order.invoice?.payment;
                if (
                    payment &&
                    payment.method === PaymentMethod.MIDTRANS &&
                    payment.status === PaymentStatus.SETTLEMENT
                ) {
                    return total + Number(payment.amount);
                }
                return total;
            }, 0),
            earningDate: date,
        };
    }

    async getPendingOrdersByDate(date: Date): Promise<Order[]> {
        return await this.orderRepository.find({
            where: {
                service_date: date,
                status: OrderStatusEnum.PENDING,
            },
        });
    }
}
