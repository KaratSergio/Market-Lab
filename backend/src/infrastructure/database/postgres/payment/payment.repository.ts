import { Repository, Between } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentRepository as DomainPaymentRepository } from '@domain/payment/payment.repository';
import { PaymentDomainEntity } from '@domain/payment/payment.entity';
import { PaymentOrmEntity } from './payment.entity';
import { PAYMENT_STATUS, PaymentStatus } from '@domain/payment/types';

@Injectable()
export class PostgresPaymentRepository extends DomainPaymentRepository {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
  ) {
    super();
  }

  async create(data: Partial<PaymentDomainEntity>): Promise<PaymentDomainEntity> {
    const ormEntity = this.toOrmEntity(data);
    const savedOrmEntity = await this.paymentRepository.save(ormEntity);
    return this.toDomainEntity(savedOrmEntity);
  }

  async findById(id: string): Promise<PaymentDomainEntity | null> {
    if (!id) return null;
    const ormEntity = await this.paymentRepository.findOne({
      where: { id }
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async update(id: string, data: Partial<PaymentDomainEntity>): Promise<PaymentDomainEntity> {
    if (!id) throw new Error('Payment ID is required for update');

    const existingEntity = await this.paymentRepository.findOne({ where: { id } });
    if (!existingEntity) throw new Error(`Payment with id ${id} not found`);

    Object.assign(existingEntity, {
      status: data.status ?? existingEntity.status,
      transactionId: data.transactionId ?? existingEntity.transactionId,
      providerResponse: data.providerResponse ?? existingEntity.providerResponse,
      refundedAmount: data.refundedAmount ?? existingEntity.refundedAmount,
      failureReason: data.failureReason ?? existingEntity.failureReason,
      paidAt: data.paidAt ?? existingEntity.paidAt,
      refundedAt: data.refundedAt ?? existingEntity.refundedAt,
      updatedAt: new Date()
    });

    const updatedOrmEntity = await this.paymentRepository.save(existingEntity);
    return this.toDomainEntity(updatedOrmEntity);
  }
  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Payment ID is required for delete');
    await this.paymentRepository.delete(id);
  }

  // QueryableRepository methods
  async findOne(filter: Partial<PaymentDomainEntity>): Promise<PaymentDomainEntity | null> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    if (filter.id) queryBuilder.andWhere('payment.id = :id', { id: filter.id });
    if (filter.orderId) queryBuilder.andWhere('payment.orderId = :orderId', { orderId: filter.orderId });
    if (filter.userId) queryBuilder.andWhere('payment.userId = :userId', { userId: filter.userId });
    if (filter.status) queryBuilder.andWhere('payment.status = :status', { status: filter.status });
    if (filter.transactionId) queryBuilder.andWhere('payment.transactionId = :transactionId', { transactionId: filter.transactionId });

    const ormEntity = await queryBuilder.getOne();
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findMany(filter: Partial<PaymentDomainEntity>): Promise<PaymentDomainEntity[]> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    if (filter.id) queryBuilder.andWhere('payment.id = :id', { id: filter.id });
    if (filter.orderId) queryBuilder.andWhere('payment.orderId = :orderId', { orderId: filter.orderId });
    if (filter.userId) queryBuilder.andWhere('payment.userId = :userId', { userId: filter.userId });
    if (filter.status) queryBuilder.andWhere('payment.status = :status', { status: filter.status });
    if (filter.transactionId) queryBuilder.andWhere('payment.transactionId = :transactionId', { transactionId: filter.transactionId });

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  async findAll(): Promise<PaymentDomainEntity[]> {
    const ormEntities = await this.paymentRepository.find({
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomainEntity);
  }

  // Payment-specific methods
  async findByOrderId(orderId: string): Promise<PaymentDomainEntity | null> {
    const ormEntity = await this.paymentRepository.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' }
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByTransactionId(transactionId: string): Promise<PaymentDomainEntity | null> {
    const ormEntity = await this.paymentRepository.findOne({
      where: { transactionId }
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<PaymentDomainEntity[]> {
    const ormEntities = await this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findByStatus(status: string): Promise<PaymentDomainEntity[]> {
    const ormEntities = await this.paymentRepository.find({
      where: { status: status as PaymentStatus }
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findPendingPayments(): Promise<PaymentDomainEntity[]> {
    const ormEntities = await this.paymentRepository.find({
      where: { status: PAYMENT_STATUS.PENDING }
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findFailedPayments(): Promise<PaymentDomainEntity[]> {
    const ormEntities = await this.paymentRepository.find({
      where: { status: PAYMENT_STATUS.FAILED }
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async getPaymentStats(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    successfulPayments: number;
    failedPayments: number;
    averagePaymentValue: number;
    refundedAmount: number;
  }> {
    const successfulResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalRevenue')
      .addSelect('AVG(payment.amount)', 'averagePaymentValue')
      .where('payment.status = :status', { status: PAYMENT_STATUS.PAID })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    const successfulPayments = await this.paymentRepository.count({
      where: {
        status: PAYMENT_STATUS.PAID,
        createdAt: Between(startDate, endDate)
      }
    });

    const failedPayments = await this.paymentRepository.count({
      where: {
        status: PAYMENT_STATUS.FAILED,
        createdAt: Between(startDate, endDate)
      }
    });

    const refundedResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.refundedAmount)', 'refundedAmount')
      .where('payment.status IN (:...statuses)', {
        statuses: [PAYMENT_STATUS.REFUNDED, PAYMENT_STATUS.PARTIALLY_REFUNDED]
      })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return {
      totalRevenue: parseFloat(successfulResult.totalRevenue || '0'),
      successfulPayments,
      failedPayments,
      averagePaymentValue: parseFloat(successfulResult.averagePaymentValue || '0'),
      refundedAmount: parseFloat(refundedResult.refundedAmount || '0')
    };
  }

  // Utility methods
  async exists(id: string): Promise<boolean> {
    if (!id) return false;
    const count = await this.paymentRepository.count({ where: { id } });
    return count > 0;
  }

  async existsByOrderId(orderId: string): Promise<boolean> {
    if (!orderId) return false;
    const count = await this.paymentRepository.count({ where: { orderId } });
    return count > 0;
  }

  private toDomainEntity(ormEntity: PaymentOrmEntity): PaymentDomainEntity {
    return new PaymentDomainEntity(
      ormEntity.id,
      ormEntity.orderId,
      ormEntity.userId,
      parseFloat(ormEntity.amount.toString()),
      ormEntity.currency,
      ormEntity.method,
      ormEntity.provider,
      ormEntity.status,
      ormEntity.transactionId,
      ormEntity.cardDetails,
      ormEntity.cryptoDetails,
      ormEntity.providerResponse,
      parseFloat(ormEntity.refundedAmount.toString()),
      ormEntity.failureReason,
      ormEntity.paidAt,
      ormEntity.refundedAt,
      ormEntity.createdAt,
      ormEntity.updatedAt
    );
  }

  private toOrmEntity(domainEntity: Partial<PaymentDomainEntity>): PaymentOrmEntity {
    const ormEntity = new PaymentOrmEntity();

    if (domainEntity.id) ormEntity.id = domainEntity.id;
    if (domainEntity.orderId) ormEntity.orderId = domainEntity.orderId;
    if (domainEntity.userId) ormEntity.userId = domainEntity.userId;
    if (domainEntity.amount !== undefined) ormEntity.amount = domainEntity.amount;
    if (domainEntity.currency) ormEntity.currency = domainEntity.currency;
    if (domainEntity.method) ormEntity.method = domainEntity.method;
    if (domainEntity.provider) ormEntity.provider = domainEntity.provider;
    if (domainEntity.status) ormEntity.status = domainEntity.status;
    if (domainEntity.transactionId) ormEntity.transactionId = domainEntity.transactionId;
    if (domainEntity.cardDetails) ormEntity.cardDetails = domainEntity.cardDetails;
    if (domainEntity.cryptoDetails) ormEntity.cryptoDetails = domainEntity.cryptoDetails;
    if (domainEntity.providerResponse) ormEntity.providerResponse = domainEntity.providerResponse;
    if (domainEntity.refundedAmount !== undefined) ormEntity.refundedAmount = domainEntity.refundedAmount;
    if (domainEntity.failureReason) ormEntity.failureReason = domainEntity.failureReason;
    if (domainEntity.paidAt) ormEntity.paidAt = domainEntity.paidAt;
    if (domainEntity.refundedAt) ormEntity.refundedAt = domainEntity.refundedAt;
    if (domainEntity.createdAt) ormEntity.createdAt = domainEntity.createdAt;
    if (domainEntity.updatedAt) ormEntity.updatedAt = domainEntity.updatedAt;

    return ormEntity;
  }
}