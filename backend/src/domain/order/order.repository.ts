import { BaseRepository, QueryableRepository } from '@shared/interfaces/repository.interface';
import { OrderDomainEntity } from './order.entity';

export abstract class OrderRepository implements
  BaseRepository<OrderDomainEntity>,
  QueryableRepository<OrderDomainEntity> {

  // BaseRepository methods
  abstract create(data: Partial<OrderDomainEntity>): Promise<OrderDomainEntity>;
  abstract findById(id: string): Promise<OrderDomainEntity | null>;
  abstract update(id: string, data: Partial<OrderDomainEntity>): Promise<OrderDomainEntity>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository methods
  abstract findOne(filter: Partial<OrderDomainEntity>): Promise<OrderDomainEntity | null>;
  abstract findMany(filter: Partial<OrderDomainEntity>): Promise<OrderDomainEntity[]>;
  abstract findAll(): Promise<OrderDomainEntity[]>;

  // Order-specific methods
  abstract findByUserId(userId: string): Promise<OrderDomainEntity[]>;
  abstract findByOrderNumber(orderNumber: string): Promise<OrderDomainEntity | null>;
  abstract findByStatus(status: string): Promise<OrderDomainEntity[]>;
  abstract findByPaymentStatus(paymentStatus: string): Promise<OrderDomainEntity[]>;
  abstract findRecentOrders(limit: number): Promise<OrderDomainEntity[]>;
  abstract getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    completedOrders?: number;
    cancelledOrders?: number;
    refundedOrders?: number;
    [key: string]: number | undefined;
  }>;
}