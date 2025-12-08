import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { OrderDomainEntity } from './order.entity';
import { OrderRepository } from './order.repository';
import { CreateOrderDto, UpdateOrderStatusDto, UpdatePaymentStatusDto, ORDER_STATUS, PAYMENT_STATUS } from './types';

@Injectable()
export class OrderService {
  constructor(
    @Inject('OrderRepository')
    private readonly orderRepository: OrderRepository,
  ) { }

  async createOrder(createDto: CreateOrderDto, cartItems: any[], totals: any): Promise<OrderDomainEntity> {
    //! Конвертируем товары из корзины в формат заказа
    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      name: item.name || 'Product',
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.subtotal,
      imageUrl: item.imageUrl
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
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderDomainEntity> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getUserOrders(userId: string): Promise<OrderDomainEntity[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async updateOrderStatus(id: string, updateDto: UpdateOrderStatusDto): Promise<OrderDomainEntity> {
    const order = await this.getOrderById(id);

    try {
      order.updateStatus(updateDto.status as any, updateDto.notes);
    } catch (error) {
      throw new BadRequestException(error.message);
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

    order.updatePaymentStatus(updateDto.paymentStatus as any, updateDto.transactionId);

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

    if (!order.isRefundable()) {
      throw new BadRequestException('Order is not refundable');
    }

    // Return initialization logic
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

  async getOrderStats(): Promise<any> {
    return this.orderRepository.getOrderStats();
  }

  async findPendingOrders(): Promise<OrderDomainEntity[]> {
    return this.orderRepository.findByStatus(ORDER_STATUS.PENDING);
  }

  async findUnpaidOrders(): Promise<OrderDomainEntity[]> {
    return this.orderRepository.findByPaymentStatus(PAYMENT_STATUS.PENDING);
  }

  // Cost calculation
  calculateOrderTotals(items: any[], shippingFee: number = 5, taxRate: number = 0.1, discountAmount: number = 0): any {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
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