import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import {
    Between,
    FindOptionsWhere,
    In,
    MoreThanOrEqual,
    Not,
    Repository,
} from 'typeorm';
import { OrderDateFilter } from '~/common/enums/order-date.enum';
import { OrderStatusEnum } from '~/common/enums/order-status.enum';
import { AcUnit } from '../ac-unit/entities/ac-unit.entity';
import { JwtPayload } from '../auth/dto/auth.response';
import { UserService } from '../user/user.service';
import {
    CancelOrderRequestDto,
    CreateOrderRequestDto,
} from './dto/order.request';
import { OrderResponse, toOrderResponse } from './dto/order.response';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(AcUnit)
        private readonly acUnitRepository: Repository<AcUnit>,
        private readonly userService: UserService,
    ) {}

    private readonly logger = new Logger(OrderService.name);

    async createForCustomer(
        user: JwtPayload,
        createOrderDto: CreateOrderRequestDto,
    ): Promise<OrderResponse> {
        this.logger.debug(
            `OrderService.create: ${JSON.stringify(createOrderDto)}`,
        );

        const userEntity = await this.userService.getById(user.sub);

        const order = this.orderRepository.create({
            ac_problems: createOrderDto.acProblems,
            service_location: createOrderDto.serviceLocation,
            property_type: createOrderDto.propertyType,
            property_floor: createOrderDto.floor.toString(),
            service_date: createOrderDto.serviceDate,
            note: createOrderDto.note,
            customer: userEntity,
        });

        const createdOrder = await this.orderRepository.save(order);

        const acUnits = createOrderDto.acUnits.map((acUnit): AcUnit => {
            return this.acUnitRepository.create({
                orders: createdOrder,
                ac_type_name: acUnit.acTypeId,
                ac_capacity: acUnit.acCapacity,
                brand: acUnit.brand,
                quantity: acUnit.quantity,
            });
        });

        await this.acUnitRepository.save(acUnits);
        const orderWithAcUnits = await this.orderRepository.findOne({
            where: { id: createdOrder.id },
            relations: {
                ac_units: true,
                customer: true,
            },
        });
        return toOrderResponse(orderWithAcUnits);
    }

    async getAllForCustomer(
        user: JwtPayload,
        status?: OrderStatusEnum | 'progress',
    ): Promise<OrderResponse[]> {
        this.logger.debug(
            `OrderService.getAllByCustomer(user: ${JSON.stringify(user)}, status: ${JSON.stringify(status)})`,
        );

        // Get all orders with status is not completed and cancelled
        if (status === 'progress') {
            const orders = await this.orderRepository.find({
                where: [
                    {
                        customer: {
                            id: user.sub,
                        },
                        status: Not(
                            In([
                                OrderStatusEnum.CANCELLED,
                                OrderStatusEnum.COMPLETED,
                            ]),
                        ),
                    },
                ],
                order: {
                    service_date: 'asc',
                },
                relations: {
                    ac_units: true,
                    customer: true,
                },
            });
            return orders.map((order) => toOrderResponse(order));
        }

        const orders = await this.orderRepository.find({
            where: {
                customer: {
                    id: user.sub,
                },
                status: status,
            },
            order: {
                service_date: 'asc',
            },
            relations: {
                ac_units: true,
                customer: true,
            },
        });
        return orders.map((order) => toOrderResponse(order));
    }

    async getAllForTechnician(
        user: JwtPayload,
        serviceDate?: OrderDateFilter,
    ): Promise<OrderResponse[]> {
        this.logger.debug(
            `OrderService.getAllByTechnician(user: ${JSON.stringify(user)}, serviceDate: ${JSON.stringify(serviceDate)})`,
        );

        const whereClause: FindOptionsWhere<Order> = {};

        switch (serviceDate) {
            case OrderDateFilter.TODAY: {
                const todayStart = startOfDay(new Date());
                const todayEnd = endOfDay(new Date());
                console.log(todayStart, todayEnd);
                whereClause.service_date = Between(todayStart, todayEnd);
                break;
            }
            case OrderDateFilter.TOMORROW: {
                const tomorrow = addDays(new Date(), 1);
                const tomorrowStart = startOfDay(tomorrow);
                const tomorrowEnd = endOfDay(tomorrow);
                whereClause.service_date = Between(tomorrowStart, tomorrowEnd);
                break;
            }
            case OrderDateFilter.UPCOMING: {
                const upcomingDate = startOfDay(addDays(new Date(), 2));
                whereClause.service_date = MoreThanOrEqual(upcomingDate);
                break;
            }
        }

        this.logger.debug(
            `Executing query with where clause: ${JSON.stringify(whereClause)}`,
        );

        // 4. Jalankan query dengan 'where' yang sudah dinamis
        const orders = await this.orderRepository.find({
            where: whereClause,
            relations: {
                ac_units: true,
                customer: true,
            },
            order: {
                service_date: 'ASC', // Urutkan berdasarkan tanggal servis
            },
        });

        return orders.map((order) => toOrderResponse(order));
    }

    async getOneByIdForTechnician(
        user: JwtPayload,
        orderId: string,
    ): Promise<OrderResponse> {
        this.logger.debug(
            `OrderService.getOneByIdForTechnician(user: ${JSON.stringify(user)}, orderId: ${orderId})`,
        );
        try {
            const order = await this.orderRepository.findOne({
                where: { id: orderId },
                relations: {
                    ac_units: true,
                    customer: true,
                },
            });
            if (!order) {
                this.logger.warn(`Order with id ${orderId} not found`);
                throw new NotFoundException(
                    `Order with id ${orderId} not found`,
                );
            }
            return toOrderResponse(order);
        } catch (error) {
            this.logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async updateStatusByIdForTechnician(
        user: JwtPayload,
        orderId: string,
        status: OrderStatusEnum,
    ): Promise<OrderResponse> {
        this.logger.debug(
            `OrderService.updateStatusByIdForTechnician(user: ${JSON.stringify(
                user,
            )}, orderId: ${orderId}, status: ${status})`,
        );
        try {
            const order = await this.orderRepository.findOne({
                where: { id: orderId },
                relations: {
                    ac_units: true,
                    customer: true,
                },
            });

            const technicianEntity = await this.userService.getById(user.sub);

            if (!order) {
                this.logger.warn(`Order with id ${orderId} not found`);
                throw new NotFoundException(
                    `Order with id ${orderId} not found`,
                );
            }

            order.status = status;
            order.technician = technicianEntity;
            await this.orderRepository.save(order);
            return toOrderResponse(order);
        } catch (error) {
            this.logger.error(`Error updating order status: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }
    }

    async cancelByIdForCustomer(
        user: JwtPayload,
        orderId: string,
        request: CancelOrderRequestDto,
    ): Promise<OrderResponse> {
        this.logger.debug(
            `OrderService.cancelByIdForCustomer(user: ${JSON.stringify(
                user,
            )}, orderId: ${orderId}, request: ${JSON.stringify(request)})`,
        );
        try {
            // Get order by order id and customer id
            const order = await this.orderRepository.findOne({
                where: { id: orderId, customer: { id: user.sub } },
                relations: {
                    ac_units: true,
                    customer: true,
                },
            });
            if (!order) {
                this.logger.warn(`Order with id ${orderId} not found`);
                throw new NotFoundException(
                    `Order with id ${orderId} not found`,
                );
            }

            // is status order still pending
            if (order.status !== OrderStatusEnum.PENDING) {
                this.logger.warn(
                    `Order with id ${orderId} is not in pending status`,
                );
                throw new Error(
                    `Order with id ${orderId} is not in pending status`,
                );
            }

            // Update order data
            order.status = OrderStatusEnum.CANCELLED;
            order.cancellation_reason = request.reason;
            order.cancellation_note = request.note;
            order.cancelled_by = {
                id: user.sub,
                role: user.role,
                fullName: user.fullName,
            };

            await this.orderRepository.save(order);
            return toOrderResponse(order);
        } catch (error) {
            this.logger.error(`Error canceling order: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }
    }

    async cancelByIdForTechnician(
        user: JwtPayload,
        orderId: string,
        request: CancelOrderRequestDto,
    ): Promise<OrderResponse> {
        this.logger.debug(
            `OrderService.cancelByIdForTechnician(user: ${JSON.stringify(
                user,
            )}, orderId: ${orderId}, request: ${JSON.stringify(request)})`,
        );
        try {
            // Get order by order id
            const order = await this.orderRepository.findOne({
                where: { id: orderId },
                relations: {
                    ac_units: true,
                    customer: true,
                },
            });
            if (!order) {
                this.logger.warn(`Order with id ${orderId} not found`);
                throw new NotFoundException(
                    `Order with id ${orderId} not found`,
                );
            }

            // Update order data
            order.status = OrderStatusEnum.CANCELLED;
            order.cancellation_reason = request.reason;
            order.cancellation_note = request.note;
            order.cancelled_by = {
                id: user.sub,
                role: user.role,
                fullName: user.fullName,
            };

            await this.orderRepository.save(order);
            return toOrderResponse(order);
        } catch (error) {
            this.logger.error(`Error canceling order: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }
    }

    async getOneByIdForCustomer(
        user: JwtPayload,
        orderId: string,
    ): Promise<OrderResponse> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId, customer: { id: user.sub } },
            relations: {
                ac_units: true,
                customer: true,
            },
        });
        return toOrderResponse(order);
    }
}
