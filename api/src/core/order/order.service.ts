import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Not, Repository } from 'typeorm';
import { JwtPayload } from '../auth/dto/auth.response';
import { CreateOrderRequestDto } from './dto/order.request';
import { UserService } from '../user/user.service';
import { OrderResponse, toOrderResponse } from './dto/order.response';
import { AcUnit } from '../ac-unit/entities/ac-unit.entity';
import { OrderStatusEnum } from '~/common/enums/order-status.enum';

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

  async create(
    user: JwtPayload,
    createOrderDto: CreateOrderRequestDto,
  ): Promise<OrderResponse> {
    this.logger.debug(`OrderService.create: ${JSON.stringify(createOrderDto)}`);

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

  async getAll(
    user: JwtPayload,
    status?: keyof typeof OrderStatusEnum | 'progress',
  ): Promise<OrderResponse[]> {
    this.logger.debug(
      `OrderService.getAll(user: ${JSON.stringify(user)}, status: ${JSON.stringify(status)})`,
    );

    // Get all orders with status is not completed and cancelled
    if (status === 'progress') {
      const orders = await this.orderRepository.find({
        where: [
          // Exclude COMPLETED and CANCELLED statuses
          {
            customer: {
              id: user.sub,
            },
            status: Not(OrderStatusEnum.COMPLETED),
          },
          {
            customer: {
              id: user.sub,
            },
            status: Not(OrderStatusEnum.CANCELLED),
          },
        ],
        order: {
          service_date: 'DESC',
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
        status: status as OrderStatusEnum,
      },
      relations: {
        ac_units: true,
        customer: true,
      },
    });
    return orders.map((order) => toOrderResponse(order));
  }

  async getOneByCustomerId(
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
