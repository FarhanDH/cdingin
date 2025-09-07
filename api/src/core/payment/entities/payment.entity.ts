import {
    Entity,
    PrimaryColumn,
    ManyToOne,
    Relation,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PaymentGateway } from '~/common/enums/payment.enum';
import { TransactionStatus } from '~/common/enums/transaction-status.enum';
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
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status: TransactionStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: PaymentGateway,
        default: PaymentGateway.MIDTRANS,
    })
    payment_gateway: PaymentGateway;

    /** Store the full webhook response from the payment gateway for auditing. */
    @Column({ type: 'jsonb', nullable: true })
    gateway_response: object | null;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at: Date;
}
