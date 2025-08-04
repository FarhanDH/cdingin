import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AcUnit } from '../ac-unit/entities/ac-unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, AcUnit]), UserModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
