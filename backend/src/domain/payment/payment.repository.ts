import { BaseRepository, QueryableRepository } from '@shared/interfaces/repository.interface';
import { PaymentDomainEntity } from './payment.entity';

export abstract class PaymentRepository implements
  BaseRepository<PaymentDomainEntity>,
  QueryableRepository<PaymentDomainEntity> {

  // BaseRepository methods
  abstract create(data: Partial<PaymentDomainEntity>): Promise<PaymentDomainEntity>;
  abstract findById(id: string): Promise<PaymentDomainEntity | null>;
  abstract update(id: string, data: Partial<PaymentDomainEntity>): Promise<PaymentDomainEntity>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository methods
  abstract findOne(filter: Partial<PaymentDomainEntity>): Promise<PaymentDomainEntity | null>;
  abstract findMany(filter: Partial<PaymentDomainEntity>): Promise<PaymentDomainEntity[]>;
  abstract findAll(): Promise<PaymentDomainEntity[]>;

  // Payment-specific methods
  abstract findByOrderId(orderId: string): Promise<PaymentDomainEntity | null>;
  abstract findByTransactionId(transactionId: string): Promise<PaymentDomainEntity | null>;
  abstract findByUserId(userId: string): Promise<PaymentDomainEntity[]>;
  abstract findByStatus(status: string): Promise<PaymentDomainEntity[]>;
  abstract findPendingPayments(): Promise<PaymentDomainEntity[]>;
  abstract findFailedPayments(): Promise<PaymentDomainEntity[]>;
  abstract getPaymentStats(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    successfulPayments: number;
    failedPayments: number;
    averagePaymentValue: number;
    refundedAmount: number;
  }>;
}