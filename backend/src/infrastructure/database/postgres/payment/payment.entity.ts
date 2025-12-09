import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserOrmEntity } from '../users/user.entity';
import { OrderOrmEntity } from '../order/order.entity';
import { PAYMENT_METHOD, PAYMENT_PROVIDER, PAYMENT_STATUS } from '@domain/payment/types';
import type { PaymentMethod, PaymentProvider, PaymentStatus } from '@domain/payment/types';

@Entity('payments')
export class PaymentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PAYMENT_METHOD,
    default: PAYMENT_METHOD.CREDIT_CARD
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PAYMENT_PROVIDER,
    default: PAYMENT_PROVIDER.STRIPE
  })
  provider: PaymentProvider;

  @Column({
    type: 'enum',
    enum: PAYMENT_STATUS,
    default: PAYMENT_STATUS.PENDING
  })
  status: PaymentStatus;

  @Column({ nullable: true, unique: true })
  transactionId: string;

  @Column({ type: 'jsonb', nullable: true })
  cardDetails?: {
    last4: string;
    brand: string;
    country: string;
    expMonth: number;
    expYear: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  cryptoDetails?: {
    currency: string;
    address: string;
    amount: string;
    network: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  providerResponse?: Record<string, unknown>;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundedAmount: number;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  refundedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'userId' })
  user: UserOrmEntity;

  @ManyToOne(() => OrderOrmEntity)
  @JoinColumn({ name: 'orderId' })
  order: OrderOrmEntity;
}