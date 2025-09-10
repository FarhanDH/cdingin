import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '~/common/enums/payment-status.enum';
import { PaymentMethod } from '~/common/enums/payment.enum';
import { Invoice } from '~/core/invoice/entities/invoice.entity';

@Entity('payments')
export class Payment {
    /** We use the transaction_id from Midtrans as our primary key. */
    @PrimaryColumn()
    id: string;

    /** The invoice this transaction is for. */
    @ManyToOne(() => Invoice, (invoice) => invoice.payments)
    invoice: Relation<Invoice>;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
    })
    status: PaymentStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        nullable: true,
    })
    method: PaymentMethod | null;

    /** Store the full webhook response from the payment gateway for auditing. */
    @Column({ type: 'jsonb', nullable: true })
    gateway_response: object | null;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at: Date;
}
