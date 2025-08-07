import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { OrderStatusEnum } from '~/common/enums/order-status.enum';
import { generateUniqueId } from '~/common/utils';
import { AcUnit } from '~/core/ac-unit/entities/ac-unit.entity';
import { User } from '~/core/user/entities/user.entity';

export interface Subject {
    id: string;
    role: string;
    fullName: string;
}

@Entity('orders')
export class Order {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => User, (user) => user.orders)
    customer: Relation<User>;

    @ManyToOne(() => User, (user) => user.orders)
    technician: Relation<User>;

    @Column({ type: 'varchar', array: true })
    ac_problems: string[];

    @OneToMany(() => AcUnit, (acUnit) => acUnit.orders)
    ac_units: Relation<AcUnit>[];

    @Column({ type: 'varchar', length: 255 })
    service_location: string;

    @Column({ type: 'varchar', length: 255 })
    property_type: string;

    @Column({ type: 'varchar', length: 2 })
    property_floor: string;

    @Column({ type: 'date' })
    service_date: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    note: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    cancellation_reason: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    cancellation_note: string;

    @Column({ type: 'json', nullable: true })
    cancelled_by: Subject;

    @Column({
        type: 'enum',
        enum: OrderStatusEnum,
        default: OrderStatusEnum.PENDING,
    })
    status: OrderStatusEnum;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at: Date;

    @BeforeInsert()
    generateId() {
        this.id = `S-${generateUniqueId(10)}`;
    }
}
