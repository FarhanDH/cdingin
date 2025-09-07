import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    Relation,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { InvoiceStatus } from '~/common/enums/invoice.enum';
import { PaymentMethod } from '~/common/enums/payment.enum';
import { Order } from '~/core/order/entities/order.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from '~/core/payment/entities/payment.entity';

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Order, (order) => order.invoice)
    @JoinColumn()
    order: Relation<Order>;

    @Column({ unique: true })
    invoice_number: string;

    @Column({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.UNPAID,
    })
    status: InvoiceStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total_amount: number;

    @Column({ type: 'timestamp with time zone' })
    issued_at: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    paid_at: Date | null;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        nullable: true,
    })
    payment_method: PaymentMethod | null;

    /** The list of items included in this invoice. */
    @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
    items: Relation<InvoiceItem[]>;

    /** A log of all payment attempts for this invoice. */
    @OneToMany(() => Payment, (transaction) => transaction.invoice)
    payments: Relation<Payment[]>;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at: Date;
}
