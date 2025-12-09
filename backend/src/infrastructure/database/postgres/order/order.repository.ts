import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderRepository as DomainOrderRepository } from '@domain/order/order.repository';
import { OrderDomainEntity, OrderItem } from '@domain/order/order.entity';
import { OrderOrmEntity, } from './order.entity';
import { OrderItemOrmEntity } from './order-item.entity';
import { ORDER_STATUS, OrderStatus, PaymentStatus } from '@domain/order/types';


@Injectable()
export class PostgresOrderRepository extends DomainOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepository: Repository<OrderOrmEntity>,
    @InjectRepository(OrderItemOrmEntity)
    private readonly orderItemRepository: Repository<OrderItemOrmEntity>,
  ) { super() }

  async create(data: Partial<OrderDomainEntity>): Promise<OrderDomainEntity> {
    const ormEntity = this.toOrmEntity(data);
    const savedOrmEntity = await this.orderRepository.save(ormEntity);
    return this.toDomainEntity(savedOrmEntity);
  }

  async findById(id: string): Promise<OrderDomainEntity | null> {
    if (!id) return null;
    const ormEntity = await this.orderRepository.findOne({
      where: { id },
      relations: ['items']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async update(id: string, data: Partial<OrderDomainEntity>): Promise<OrderDomainEntity> {
    if (!id) throw new Error('Order ID is required for update');

    await this.orderRepository.update(id, {
      status: data.status,
      paymentStatus: data.paymentStatus,
      notes: data.notes,
      transactionId: data.transactionId,
      updatedAt: new Date()
    });

    const updatedOrmEntity = await this.orderRepository.findOne({
      where: { id },
      relations: ['items']
    });

    if (!updatedOrmEntity) throw new Error(`Order with id ${id} not found after update`);
    return this.toDomainEntity(updatedOrmEntity);
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Order ID is required for delete');
    await this.orderRepository.delete(id);
  }

  // QueryableRepository methods
  async findOne(filter: Partial<OrderDomainEntity>): Promise<OrderDomainEntity | null> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    if (filter.id) queryBuilder.andWhere('order.id = :id', { id: filter.id });
    if (filter.userId) queryBuilder.andWhere('order.userId = :userId', { userId: filter.userId });
    if (filter.orderNumber) queryBuilder.andWhere('order.orderNumber = :orderNumber', { orderNumber: filter.orderNumber });
    if (filter.status) queryBuilder.andWhere('order.status = :status', { status: filter.status });
    if (filter.paymentStatus) queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: filter.paymentStatus });

    const ormEntity = await queryBuilder.getOne();
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findMany(filter: Partial<OrderDomainEntity>): Promise<OrderDomainEntity[]> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    if (filter.id) queryBuilder.andWhere('order.id = :id', { id: filter.id });
    if (filter.userId) queryBuilder.andWhere('order.userId = :userId', { userId: filter.userId });
    if (filter.orderNumber) queryBuilder.andWhere('order.orderNumber = :orderNumber', { orderNumber: filter.orderNumber });
    if (filter.status) queryBuilder.andWhere('order.status = :status', { status: filter.status });
    if (filter.paymentStatus) queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: filter.paymentStatus });

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  async findAll(): Promise<OrderDomainEntity[]> {
    const ormEntities = await this.orderRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomainEntity);
  }

  // Order-specific methods
  async findByUserId(userId: string): Promise<OrderDomainEntity[]> {
    const ormEntities = await this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' }
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderDomainEntity | null> {
    const ormEntity = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByStatus(status: string): Promise<OrderDomainEntity[]> {
    const ormEntities = await this.orderRepository.find({
      where: { status: status as OrderStatus },
      relations: ['items']
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findByPaymentStatus(paymentStatus: string): Promise<OrderDomainEntity[]> {
    const ormEntities = await this.orderRepository.find({
      where: { paymentStatus: paymentStatus as PaymentStatus },
      relations: ['items']
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findRecentOrders(limit: number = 10): Promise<OrderDomainEntity[]> {
    const ormEntities = await this.orderRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
      take: limit
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
  }> {
    const totalOrders = await this.orderRepository.count();

    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalRevenue')
      .addSelect('AVG(order.totalAmount)', 'averageOrderValue')
      .where('order.status NOT IN (:...statuses)', {
        statuses: [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED]
      })
      .getRawOne();

    const pendingOrders = await this.orderRepository.count({
      where: { status: ORDER_STATUS.PENDING }
    });

    return {
      totalOrders,
      totalRevenue: parseFloat(result.totalRevenue || '0'),
      averageOrderValue: parseFloat(result.averageOrderValue || '0'),
      pendingOrders
    };
  }

  // Utility methods
  async exists(id: string): Promise<boolean> {
    if (!id) return false;
    const count = await this.orderRepository.count({ where: { id } });
    return count > 0;
  }

  async existsByOrderNumber(orderNumber: string): Promise<boolean> {
    if (!orderNumber) return false;
    const count = await this.orderRepository.count({ where: { orderNumber } });
    return count > 0;
  }

  private toDomainEntity(ormEntity: OrderOrmEntity): OrderDomainEntity {
    const items = ormEntity.items?.map(item => new OrderItem(
      item.productId,
      item.name,
      item.quantity,
      parseFloat(item.price.toString()),
      parseFloat(item.totalPrice.toString()),
      item.imageUrl
    )) || [];

    return new OrderDomainEntity({
      id: ormEntity.id,
      userId: ormEntity.userId,
      cartId: ormEntity.cartId,
      orderNumber: ormEntity.orderNumber,
      shippingAddress: ormEntity.shippingAddress,
      currency: ormEntity.currency,
      status: ormEntity.status,
      paymentStatus: ormEntity.paymentStatus,
      items: items,
      subtotal: parseFloat(ormEntity.subtotal.toString()),
      shippingFee: parseFloat(ormEntity.shippingFee.toString()),
      taxAmount: parseFloat(ormEntity.taxAmount.toString()),
      discountAmount: parseFloat(ormEntity.discountAmount.toString()),
      totalAmount: parseFloat(ormEntity.totalAmount.toString()),
      notes: ormEntity.notes,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt
    });
  }
  private toOrmEntity(domainEntity: Partial<OrderDomainEntity>): OrderOrmEntity {
    const ormEntity = new OrderOrmEntity();

    if (domainEntity.id) ormEntity.id = domainEntity.id;
    if (domainEntity.userId) ormEntity.userId = domainEntity.userId;
    if (domainEntity.cartId) ormEntity.cartId = domainEntity.cartId;
    if (domainEntity.orderNumber) ormEntity.orderNumber = domainEntity.orderNumber;
    if (domainEntity.subtotal !== undefined) ormEntity.subtotal = domainEntity.subtotal;
    if (domainEntity.shippingFee !== undefined) ormEntity.shippingFee = domainEntity.shippingFee;
    if (domainEntity.taxAmount !== undefined) ormEntity.taxAmount = domainEntity.taxAmount;
    if (domainEntity.discountAmount !== undefined) ormEntity.discountAmount = domainEntity.discountAmount;
    if (domainEntity.totalAmount !== undefined) ormEntity.totalAmount = domainEntity.totalAmount;
    if (domainEntity.currency) ormEntity.currency = domainEntity.currency;
    if (domainEntity.status) ormEntity.status = domainEntity.status;
    if (domainEntity.paymentStatus) ormEntity.paymentStatus = domainEntity.paymentStatus;
    if (domainEntity.shippingAddress) ormEntity.shippingAddress = domainEntity.shippingAddress;
    if (domainEntity.notes) ormEntity.notes = domainEntity.notes;
    if (domainEntity.transactionId) ormEntity.transactionId = domainEntity.transactionId;
    if (domainEntity.createdAt) ormEntity.createdAt = domainEntity.createdAt;
    if (domainEntity.updatedAt) ormEntity.updatedAt = domainEntity.updatedAt;

    if (domainEntity.items && domainEntity.items.length > 0) {
      ormEntity.items = domainEntity.items.map(item => {
        const orderItem = new OrderItemOrmEntity();
        orderItem.productId = item.productId;
        orderItem.name = item.name;
        orderItem.quantity = item.quantity;
        orderItem.price = item.price;
        orderItem.totalPrice = item.totalPrice;
        orderItem.imageUrl = item.imageUrl || '';
        return orderItem;
      });
    }

    return ormEntity;
  }
}