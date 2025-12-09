import {
  Injectable, Inject, NotFoundException,
  BadRequestException, ConflictException
} from '@nestjs/common';

import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  OrderTotalsDto,
  OrderStatsDto,
  ORDER_STATUS,
  PAYMENT_STATUS,
  OrderItemModel
} from './types';

import { CartItemModel } from '@domain/cart/types';
import { OrderDomainEntity } from './order.entity';
import { OrderRepository } from './order.repository';

@Injectable()
export class OrderService {
  constructor(
    @Inject('OrderRepository')
    private readonly orderRepository: OrderRepository,
  ) { }

  async createOrder(
    createDto: CreateOrderDto,
    cartItems: CartItemModel[], //! CartItemModel = OrderItemModel
    totals: OrderTotalsDto
  ): Promise<OrderDomainEntity> {
    const orderItems: OrderItemModel[] = cartItems.map(item => ({
      ...item,
      name: item.name || 'Product',
      subtotal: item.subtotal || item.price * item.quantity,
      totalPrice: item.totalPrice || (item.subtotal || item.price * item.quantity) - (item.discount || 0)
    }));

    const order = OrderDomainEntity.create(
      createDto,
      orderItems,
      {
        subtotal: totals.subtotal,
        shippingFee: totals.shippingFee,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        totalAmount: totals.totalAmount
      }
    );

    return this.orderRepository.create(order);
  }

  async getOrderById(id: string): Promise<OrderDomainEntity> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderDomainEntity> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getUserOrders(userId: string): Promise<OrderDomainEntity[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async updateOrderStatus(id: string, updateDto: UpdateOrderStatusDto): Promise<OrderDomainEntity> {
    const order = await this.getOrderById(id);

    try {
      order.updateStatus(updateDto.status, updateDto.notes);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
    }

    const updated = await this.orderRepository.update(id, {
      status: order.status,
      notes: order.notes,
      updatedAt: order.updatedAt
    });

    if (!updated) throw new NotFoundException('Order not found after update');
    return updated;
  }

  async updatePaymentStatus(id: string, updateDto: UpdatePaymentStatusDto): Promise<OrderDomainEntity> {
    const order = await this.getOrderById(id);

    order.updatePaymentStatus(updateDto.paymentStatus, updateDto.transactionId);

    const updated = await this.orderRepository.update(id, {
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId,
      updatedAt: order.updatedAt
    });

    if (!updated) throw new NotFoundException('Order not found after update');
    return updated;
  }

  async markAsPaid(id: string, transactionId: string): Promise<OrderDomainEntity> {
    const order = await this.getOrderById(id);
    if (order.paymentStatus === PAYMENT_STATUS.PAID) throw new ConflictException('Order already paid');

    order.markAsPaid(transactionId);

    const updated = await this.orderRepository.update(id, {
      paymentStatus: order.paymentStatus,
      status: order.status,
      transactionId: order.transactionId,
      updatedAt: order.updatedAt
    });

    if (!updated) throw new NotFoundException('Order not found after update');
    return updated;
  }

  async cancelOrder(id: string, reason?: string): Promise<OrderDomainEntity> {
    const order = await this.getOrderById(id);
    if (!order.isCancellable()) throw new BadRequestException('Order cannot be cancelled at this stage');

    order.cancel(reason);

    const updated = await this.orderRepository.update(id, {
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      updatedAt: order.updatedAt
    });

    if (!updated) throw new NotFoundException('Order not found after update');
    return updated;
  }

  async initiateRefund(id: string, reason?: string): Promise<OrderDomainEntity> {
    const order = await this.getOrderById(id);
    if (!order.isRefundable()) throw new BadRequestException('Order is not refundable');

    order.updateStatus(ORDER_STATUS.REFUNDED, reason);
    order.updatePaymentStatus(PAYMENT_STATUS.REFUNDED);

    const updated = await this.orderRepository.update(id, {
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      updatedAt: order.updatedAt
    });

    if (!updated) throw new NotFoundException('Order not found after update');
    return updated;
  }

  async getOrderStats(): Promise<OrderStatsDto> {
    const stats = await this.orderRepository.getOrderStats();

    return {
      totalOrders: stats.totalOrders || 0,
      totalRevenue: stats.totalRevenue || 0,
      averageOrderValue: stats.averageOrderValue || 0,
      pendingOrders: stats.pendingOrders || 0,
      completedOrders: stats.completedOrders || 0,
      cancelledOrders: stats.cancelledOrders || 0,
      refundedOrders: stats.refundedOrders || 0,
      ...Object.fromEntries(
        Object.entries(stats).filter(([key]) =>
          !['totalOrders', 'totalRevenue', 'averageOrderValue', 'pendingOrders'].includes(key)
        )
      )
    };
  }

  async findPendingOrders(): Promise<OrderDomainEntity[]> {
    return this.orderRepository.findByStatus(ORDER_STATUS.PENDING);
  }

  async findUnpaidOrders(): Promise<OrderDomainEntity[]> {
    return this.orderRepository.findByPaymentStatus(PAYMENT_STATUS.PENDING);
  }

  calculateOrderTotals(
    items: OrderItemModel[],
    shippingFee: number = 5,
    taxRate: number = 0.1,
    discountAmount: number = 0
  ): OrderTotalsDto {
    // use the subtotal from items if there is one, or calculate it
    const subtotal = items.reduce((sum, item) =>
      sum + (item.subtotal || item.price * item.quantity), 0
    );
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + shippingFee + taxAmount - discountAmount;

    return {
      subtotal,
      shippingFee,
      taxAmount,
      discountAmount,
      totalAmount
    };
  }
}