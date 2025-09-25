import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AcUnit } from '../ac-unit/entities/ac-unit.entity';
import { PushSubscriptionModule } from '../push-subscription/push-subscription.module';
import { NotificationModule } from '../notification/notification.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, AcUnit]),
        UserModule,
        PushSubscriptionModule,
        HttpModule,
        NotificationModule,
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule {}
