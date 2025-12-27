import {
  Entity, Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, ManyToOne,
  JoinColumn
} from 'typeorm';

import { UserOrmEntity } from '../users/user.entity';
import { OrderItemOrmEntity } from './order-item.entity';
import { ORDER_STATUS, PAYMENT_STATUS } from '@domain/order/types';
import type { OrderStatus, PaymentStatus } from '@domain/order/types';
import type { Address } from '@shared/types';


@Entity('orders')
export class OrderOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  cartId: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ORDER_STATUS,
    default: ORDER_STATUS.PENDING
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PAYMENT_STATUS,
    default: PAYMENT_STATUS.PENDING
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'jsonb' })
  shippingAddress: Address;

  @Column({ type: 'jsonb', nullable: true })
  billingAddress?: Address;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  transactionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'userId' })
  user: UserOrmEntity;

  @OneToMany(() => OrderItemOrmEntity, item => item.order, {
    cascade: true,
    eager: true
  })
  items: OrderItemOrmEntity[];
}