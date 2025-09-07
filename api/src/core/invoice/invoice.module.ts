import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { OrderModule } from '../order/order.module';
import { PushSubscriptionModule } from '../push-subscription/push-subscription.module';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, InvoiceItem]),
        OrderModule,
        NotificationModule,
        PushSubscriptionModule,
    ],
    controllers: [InvoiceController],
    providers: [InvoiceService],
    exports: [InvoiceService],
})
export class InvoiceModule {}
