import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '~/common/api-response.dto';
import { Roles } from '~/common/decorators/roles.decorator';
import { OrderStatusEnum } from '~/common/enums/order-status.enum';
import { RoleEnum } from '~/common/enums/role.enum';
import { RequestWithUser } from '~/common/utils';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateOrderRequestDto } from './dto/order.request';
import { OrderResponse } from './dto/order.response';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RoleEnum.CUSTOMER)
  @Post()
  async create(
    @Request() request: RequestWithUser,
    @Body() createOrderDto: CreateOrderRequestDto,
  ): Promise<ApiResponse<OrderResponse>> {
    const data = await this.orderService.create(request.user, createOrderDto);
    return {
      message: 'Order created successfully',
      data,
    };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RoleEnum.CUSTOMER)
  @Get()
  async getAll(
    @Request() request: RequestWithUser,
    @Query('status')
    status?: keyof typeof OrderStatusEnum | 'progress',
  ): Promise<ApiResponse<OrderResponse[]>> {
    const data = await this.orderService.getAll(request.user, status);
    return {
      message: 'Orders fetched successfully',
      data,
    };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RoleEnum.CUSTOMER)
  @Get(':id')
  async getOneByCustomerId(
    @Request() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<ApiResponse<OrderResponse>> {
    const data = await this.orderService.getOneByCustomerId(request.user, id);
    return {
      message: 'Order fetched successfully',
      data,
    };
  }
}
