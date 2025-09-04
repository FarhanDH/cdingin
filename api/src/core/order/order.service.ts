import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import {
    Between,
    DataSource,
    FindOptionsWhere,
    In,
    MoreThanOrEqual,
    Not,
    Repository,
} from 'typeorm';
import { NotificationType } from '~/common/enums/notification-type.enum';
import { OrderDateFilter } from '~/common/enums/order-date.enum';
import { OrderStatusEnum } from '~/common/enums/order-status.enum';
import { calculateDistanceInMeters } from '~/common/utils';
import { AcUnit } from '../ac-unit/entities/ac-unit.entity';
import { JwtPayload } from '../auth/dto/auth.response';
import { NotificationService } from '../notification/notification.service';
import {
    PayloadMessage,
    PushSubscriptionService,
} from '../push-subscription/push-subscription.service';
import { UserService } from '../user/user.service';
import {
    CancelOrderRequestDto,
    CreateOrderRequestDto,
    UpdateOrderStatusRequestDto,
} from './dto/order.request';
import { OrderResponse, toOrderResponse } from './dto/order.response';
import { Order } from './entities/order.entity';

const SERVICE_RADIUS_METERS = 200;

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(AcUnit)
        private readonly acUnitRepository: Repository<AcUnit>,
        private readonly userService: UserService,
        private readonly pushSubscriptionService: PushSubscriptionService,
        private readonly notificationService: NotificationService,
        private readonly dataSource: DataSource,
    ) {}

    private readonly logger = new Logger(OrderService.name);

    /**
     * Creates a new order for a customer, including AC unit details, within a transaction.
     * Checks for schedule availability before creating the order.
     * @param user - The JWT payload of the authenticated customer.
     * @param createOrderDto - The data transfer object containing details for the new order.
     * @returns A promise that resolves to the created order response.
     */
    async createForCustomer(
        user: JwtPayload,
        createOrderDto: CreateOrderRequestDto,
    ): Promise<OrderResponse> {
        this.logger.debug(
            `OrderService.createForCustomer: ${JSON.stringify(createOrderDto)}`,
        );

        // Start Transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check schedule availability
            // Convert the service date string from the DTO to a Date object.
            const serviceDate = new Date(createOrderDto.serviceDate);
            // Get the start of the day for the service date.
            const dayStart = startOfDay(serviceDate);
            // Get the end of the day for the service date.
            const dayEnd = endOfDay(serviceDate);

            // Query the database to sum the quantity of AC units booked for the given service date.
            // It excludes orders that are cancelled or completed to only count active bookings.
            // The query uses a raw SQL query to join 'orders' with 'ac_units' and sum the quantities.
            const scheduleCheck = await queryRunner.manager
                .createQueryBuilder(Order, 'orders')
                .select('SUM(ac_units.quantity)', 'totalUnitsBooked')
                .innerJoin('orders.ac_units', 'ac_units')
                .where('orders.service_date BETWEEN :dayStart AND :dayEnd', {
                    dayStart,
                    dayEnd,
                })
                .andWhere('orders.status NOT IN (:...statuses)', {
                    statuses: [
                        OrderStatusEnum.CANCELLED,
                        OrderStatusEnum.COMPLETED,
                    ],
                })
                .getRawOne();

            // Parse the total units booked from the database result, defaulting to 0 if null.
            const totalUnitsBooked =
                parseInt(scheduleCheck?.totalUnitsBooked, 10) || 0;
            // Calculate the total quantity of AC units in the new order being created.
            const totalUnitsInNewOrder = createOrderDto.acUnits.reduce(
                (acc, acUnit) => acc + acUnit.quantity,
                0,
            );

            // If slot unavailable, cancel transaction and throw an exception
            // Check if adding the new order's AC units would exceed the maximum capacity (10 units).
            if (totalUnitsBooked + totalUnitsInNewOrder > 10) {
                this.logger.warn(
                    `Slot for ${serviceDate} is full. Cannot create new order.`,
                );

                throw new ConflictException(
                    'Jadwal udah penuh. Silakan pilih tanggal lain.',
                );
            }

            // If slot available, continue to process create order
            // Ensure all save operations using queryRunner.manager
            // Create a new Order entity with the provided details and associate it with the customer.
            const newOrder = queryRunner.manager.create(Order, {
                customer: {
                    id: user.sub,
                },
                ac_problems: createOrderDto.acProblems,
                latitude_service_location:
                    createOrderDto.serviceLocation.latitude,
                longitude_service_location:
                    createOrderDto.serviceLocation.longitude,
                service_location_address:
                    createOrderDto.serviceLocation.address,
                service_location_note: createOrderDto.serviceLocation.note,
                property_type: createOrderDto.propertyType,
                property_floor: createOrderDto.floor.toString(),
                service_date: createOrderDto.serviceDate,
                note: createOrderDto.note,
            });

            // Save the new order to the database within the transaction.
            const savedOrder = await queryRunner.manager.save(newOrder);

            // Save related AC Unit
            // Map the AC unit details from the DTO to new AcUnit entities, linking them to the newly saved order.
            const acUnitsToSave = createOrderDto.acUnits.map((acUnit) =>
                queryRunner.manager.create(AcUnit, {
                    orders: savedOrder, // Relate to created new order
                    ac_type_name: acUnit.acTypeId,
                    ac_capacity: acUnit.acCapacity,
                    brand: acUnit.brand,
                    quantity: acUnit.quantity,
                }),
            );
            // Save all the associated AC unit entities to the database within the transaction.
            await queryRunner.manager.save(acUnitsToSave);

            // Commit transaction
            // If all operations are successful, commit the transaction to make changes permanent.
            await queryRunner.commitTransaction();

            const technicians = await this.userService.getAllTechnicians();

            const savedNotification = technicians.map(async (technician) => {
                return await this.notificationService.create({
                    orderId: savedOrder.id,
                    recipientId: technician.id,
                    title: 'Order Baru!',
                    message: 'Ada pesanan baru dari pelanggan',
                    type: NotificationType.NEW_ORDER,
                });
            });
            const savedNotifications = await Promise.all(savedNotification);

            // Send new order notification to technicians
            const technicianSubscriptions =
                await this.pushSubscriptionService.getAllTechnicianSubscriptions();
            await this.pushSubscriptionService.sendNotifications(
                technicianSubscriptions,
                {
                    title: savedNotifications[0].title,
                    body: savedNotifications[0].message,
                    tag: savedNotifications[0].type,
                },
            );
            // Get new order for response
            const completeOrder = await this.orderRepository.findOne({
                where: { id: savedOrder.id },
                relations: {
                    ac_units: true,
                    customer: true,
                },
            });

            return toOrderResponse(completeOrder);
        } catch (error) {
            // Rollback transaction
            await queryRunner.rollbackTransaction();
            this.logger.error(error);
            throw new InternalServerErrorException(error.message);
        } finally {
            // Release query runner
            await queryRunner.release();
        }
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
        whereClause.status = Not(
            In([OrderStatusEnum.CANCELLED, OrderStatusEnum.COMPLETED]),
        );

        switch (serviceDate) {
            case OrderDateFilter.TODAY: {
                const todayStart = startOfDay(new Date());
                const todayEnd = endOfDay(new Date());
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

    /**
     * Updates the status of an order as a technician.
     * @param user - The JWT payload of the authenticated technician.
     * @param orderId - The ID of the order to be updated.
     * @param updateStatusDto - The request body containing the status to be updated.
     * @returns A promise that resolves to the updated order response.
     * @throws {@link NotFoundException} if the order with the given ID is not found.
     * @throws {@link BadRequestException} if the technician is not within the service radius when updating to 'ON_WORKING'.
     * @throws {@link InternalServerErrorException} if an error occurs while updating the order status.
     */
    async updateStatusByIdForTechnician(
        user: JwtPayload,
        orderId: string,
        updateStatusDto: UpdateOrderStatusRequestDto,
    ): Promise<OrderResponse> {
        this.logger.debug(
            `OrderService.updateStatusByIdForTechnician(user: ${JSON.stringify(
                user,
            )}, orderId: ${orderId}, updateStatusDto: ${JSON.stringify(updateStatusDto)})`,
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

            // Check if the technician is within the service radius before updating to 'ON_WORKING'
            if (updateStatusDto.status === OrderStatusEnum.ON_WORKING) {
                if (
                    !updateStatusDto.technicianLatitude ||
                    !updateStatusDto.technicianLongitude
                ) {
                    throw new BadRequestException(
                        'Koordinat teknisi diperlukan untuk memulai pekerjaan.',
                    );
                }

                const technicianPosition = {
                    lat: updateStatusDto.technicianLatitude,
                    lng: updateStatusDto.technicianLongitude,
                };
                const serviceLocation = {
                    lat: order.latitude_service_location,
                    lng: order.longitude_service_location,
                };

                const distance = calculateDistanceInMeters(
                    technicianPosition,
                    serviceLocation,
                );

                if (distance > SERVICE_RADIUS_METERS) {
                    throw new BadRequestException(
                        'Teknisi terlalu jauh dari lokasi servis.',
                    );
                }
            }

            // Get the technician entity from the database
            const technicianEntity = await this.userService.getById(user.sub);

            // Update the order status and technician
            order.status = updateStatusDto.status;
            order.technician = technicianEntity;
            await this.orderRepository.save(order);

            // Create a notification for the customer
            const notificationMessage = this.updateStatusNotificationMessage(
                updateStatusDto.status,
            );
            const savedNotification = await this.notificationService.create({
                orderId: order.id,
                recipientId: order.customer.id,
                title: notificationMessage.title,
                message: notificationMessage.body,
                type: notificationMessage.tag,
            });

            // Send the notification to the customer
            await this.pushSubscriptionService.sendNotificationToUser(
                savedNotification.recipient.id,
                {
                    title: savedNotification.title,
                    body: savedNotification.message,
                    tag: savedNotification.type,
                },
            );

            return toOrderResponse(order);
        } catch (error) {
            this.logger.error(`Error updating order status: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Cancels an order as a customer.
     * @param user - The JWT payload of the authenticated customer.
     * @param orderId - The ID of the order to be cancelled.
     * @param request - The request body containing the cancellation reason and note.
     * @returns A promise that resolves to the cancelled order response.
     * @throws {@link NotFoundException} if the order with the given ID is not found.
     * @throws {@link InternalServerErrorException} if an error occurs while cancelling the order.
     */
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
                    technician: true,
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

            // Notification received by all technicians
            const technicians = await this.userService.getAllTechnicians();
            const notificationMassage = {
                title: '💔 Pesananmu dibatalkan',
                message: 'Pesanan dibatalkan sama pelanggan',
                type: NotificationType.CANCELLED_ORDER,
            };
            const savedNotification = technicians.map(async (technician) => {
                return await this.notificationService.create({
                    orderId: order.id,
                    recipientId: technician.id,
                    ...notificationMassage,
                });
            });
            const savedNotifications = await Promise.all(savedNotification);

            const technicianSubscriptions =
                await this.pushSubscriptionService.getAllTechnicianSubscriptions();

            await this.pushSubscriptionService.sendNotifications(
                technicianSubscriptions,
                {
                    title: savedNotifications[0].title,
                    body: savedNotifications[0].message,
                    tag: savedNotifications[0].type,
                },
            );
            return toOrderResponse(order);
        } catch (error) {
            this.logger.error(`Error canceling order: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Cancels an order as a technician.
     * @param user - The JWT payload of the authenticated technician.
     * @param orderId - The ID of the order to be cancelled.
     * @param request - The request body containing the cancellation reason and note.
     * @returns A promise that resolves to the cancelled order response.
     * @throws {@link NotFoundException} if the order with the given ID is not found.
     * @throws {@link InternalServerErrorException} if an error occurs while cancelling the order.
     */
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
            // Get order by order id and technician id
            const order = await this.orderRepository.findOne({
                where: { id: orderId, technician: { id: user.sub } },
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

            // Set notification message
            const notificationMassage = this.updateStatusNotificationMessage(
                OrderStatusEnum.CANCELLED,
            );

            // Save notification message
            const savedNotification = await this.notificationService.create({
                orderId: order.id,
                recipientId: order.customer.id,
                title: notificationMassage.title,
                message: notificationMassage.body,
                type: notificationMassage.tag,
            });

            // Send notification to recipient
            await this.pushSubscriptionService.sendNotificationToUser(
                savedNotification.recipient.id,
                {
                    title: savedNotification.title,
                    body: savedNotification.message,
                    tag: savedNotification.type,
                },
            );
            return toOrderResponse(order);
        } catch (error) {
            this.logger.error(`Error canceling order: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Gets an order by id for a customer
     * @param user - The user making the request
     * @param orderId - The id of the order to get
     * @returns The order response
     */
    async getOneByIdForCustomer(
        user: JwtPayload,
        orderId: string,
    ): Promise<OrderResponse> {
        // Get the order by id and customer id
        const order = await this.orderRepository.findOne({
            where: { id: orderId, customer: { id: user.sub } },
            relations: {
                ac_units: true,
                customer: true,
            },
        });

        // Return the order response
        return toOrderResponse(order);
    }

    /**
     * Gets a notification message based on the order status
     * @param status - The order status
     * @returns The notification message
     */
    private updateStatusNotificationMessage(
        status: OrderStatusEnum,
    ): PayloadMessage {
        const tag: NotificationType = NotificationType.ORDER_STATUS_UPDATE;
        /**
         * The notification message based on the order status
         */
        switch (status) {
            case OrderStatusEnum.CONFIRMED:
                return {
                    title: 'Pesananmu Udah Diterima ',
                    body: `Teknisi udah terima pesananmu, tunggu sampai harinya yaa`,
                    tag,
                };
            case OrderStatusEnum.TECHNICIAN_ON_THE_WAY:
                return {
                    title: '  Teknisi OTW!',
                    body: `Teknisi sedang menuju ke lokasi servicemu. Siap-siap, ya!`,
                    tag,
                };
            case OrderStatusEnum.ON_WORKING:
                return {
                    title: 'Teknisi Sudah Tiba!',
                    body: `Teknisi sudah sampai!, dan lagi nge-cek AC-mu. Sabar yaa`,
                    tag,
                };
            case OrderStatusEnum.WAITING_PAYMENT:
                return {
                    title: '  Tagihan siap',
                    body: `Invoice udah dibuat. Yuk, segera selesaikan pembayarannya.`,
                    tag,
                };
            case OrderStatusEnum.COMPLETED:
                return {
                    title: '  Yeay! Service Udah Selesai',
                    body: `AC udah balik adem lagi. Makasih banyak udah percaya Cdingin `,
                    tag,
                };
            case OrderStatusEnum.CANCELLED:
                return {
                    title: '  Pesananmu dibatalkan',
                    body: `Maaf ya, teknisi belum bisa kerjain pesananmu. Coba atur pesanan baru, ya.`,
                    tag: NotificationType.CANCELLED_ORDER,
                };
            default:
                throw new Error(`Unknown status ${status}`);
        }
    }
}
