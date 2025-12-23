import {
  Injectable, Inject, NotFoundException,
  BadRequestException, ForbiddenException
} from '@nestjs/common';

import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderTotalsDto,
  OrderStatsDto,
  ORDER_STATUS,
  PAYMENT_STATUS,
  OrderItemModel
} from './types';

import { CartItemModel } from '@domain/cart/types';
import { OrderDomainEntity } from './order.entity';
import { OrderRepository } from './order.repository';
import { Role } from '@shared/types';


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

  async getOrderById(
    id: string,
    userId?: string,
    userRoles?: string[]
  ): Promise<OrderDomainEntity> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    // Check access permissions
    this._checkOrderAccess(order, userId, userRoles, 'view');

    return order;
  }

  async getOrderByNumber(
    orderNumber: string,
    userId?: string,
    userRoles?: string[]
  ): Promise<OrderDomainEntity> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) throw new NotFoundException('Order not found');

    // Check access permissions
    this._checkOrderAccess(order, userId, userRoles, 'view');

    return order;
  }

  async getUserOrders(userId: string): Promise<OrderDomainEntity[]> {
    // Customer can only see their own orders
    return this.orderRepository.findByUserId(userId);
  }

  async getSupplierOrders(
    supplierId: string,
    userId?: string,
    userRoles?: string[]
  ): Promise<OrderDomainEntity[]> {
    // Check if user is supplier or admin
    if (userRoles && !userRoles.includes(Role.SUPPLIER) && !userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only suppliers or admins can view supplier orders');
    }
    // Supplier can only see their own orders
    if (userRoles && userRoles.includes(Role.SUPPLIER) && supplierId !== userId) {
      throw new ForbiddenException('You can only view your own supplier orders');
    }

    return this.orderRepository.findByUserId(supplierId);
  }

  async getAllOrders(
    userId?: string,
    userRoles?: string[]
  ): Promise<OrderDomainEntity[]> {
    // Only admins can see all orders
    if (userRoles && !userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only admins can view all orders');
    }

    return this.orderRepository.findAll();
  }

  async updateOrderStatus(
    id: string,
    updateDto: UpdateOrderStatusDto,
    userId?: string,
    userRoles?: string[]
  ): Promise<OrderDomainEntity> {
    const order = await this.getOrderById(id, userId, userRoles);
    // Check if user can update this order
    this._checkOrderAccess(order, userId, userRoles, 'update');

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

  async cancelOrder(
    id: string,
    reason?: string,
    userId?: string,
    userRoles?: string[]
  ): Promise<OrderDomainEntity> {
    const order = await this.getOrderById(id, userId, userRoles);
    // Check if user can cancel this order
    this._checkOrderAccess(order, userId, userRoles, 'cancel');

    if (!order.isCancellable()) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

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

  async initiateRefund(
    id: string,
    reason?: string,
    userId?: string,
    userRoles?: string[]
  ): Promise<OrderDomainEntity> {
    const order = await this.getOrderById(id, userId, userRoles);
    // Check if user can request refund for this order
    this._checkOrderAccess(order, userId, userRoles, 'refund');
    if (!order.isRefundable()) throw new BadRequestException('Order is not refundable');

    order.updateStatus(ORDER_STATUS.REFUNDED, reason);

    const updated = await this.orderRepository.update(id, {
      status: order.status,
      notes: order.notes,
      updatedAt: order.updatedAt
    });

    if (!updated) throw new NotFoundException('Order not found after update');
    return updated;
  }

  async processRefund(
    id: string,
    reason?: string,
    userId?: string,
    userRoles?: string[]
  ): Promise<OrderDomainEntity> {
    // Only admins can process refunds
    if (userRoles && !userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only admins can process refunds');
    }

    const order = await this.getOrderById(id);

    if (order.status !== ORDER_STATUS.REFUNDED) {
      throw new BadRequestException('Order is not in refund requested status');
    }

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

  async getOrderStats(
    userId?: string,
    userRoles?: string[]
  ): Promise<OrderStatsDto> {
    // Only admins can see global stats
    if (userRoles && !userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only admins can view order statistics');
    }

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

  async findPendingOrders(
    userId?: string,
    userRoles?: string[]
  ): Promise<OrderDomainEntity[]> {
    // Admins and suppliers can see pending orders
    if (userRoles) {
      const canView = userRoles.includes(Role.ADMIN) || userRoles.includes(Role.SUPPLIER);
      if (!canView) {
        throw new ForbiddenException('Only admins or suppliers can view pending orders');
      }
    }

    return this.orderRepository.findByStatus(ORDER_STATUS.PENDING);
  }

  async findUnpaidOrders(
    userId?: string,
    userRoles?: string[]
  ): Promise<OrderDomainEntity[]> {
    // Only admins can see all unpaid orders
    if (userRoles && !userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only admins can view unpaid orders');
    }

    return this.orderRepository.findByPaymentStatus(PAYMENT_STATUS.PENDING);
  }

  // Helper methods
  private _checkOrderAccess(
    order: OrderDomainEntity,
    userId?: string,
    userRoles?: string[],
    action: string = 'access'
  ): void {
    // Admins can do everything
    if (userRoles && userRoles.includes(Role.ADMIN)) return;

    // Suppliers can view and update orders with their products
    if (userRoles && userRoles.includes(Role.SUPPLIER)) {
      if (action === 'view' || action === 'update') {
        // Check if order contains supplier's products
        const hasSupplierProducts = this.orderHasSupplierProducts(order, userId);
        if (hasSupplierProducts) {
          return;
        }
      }
    }

    // Customers can only access their own orders
    if (userRoles && userRoles.includes(Role.CUSTOMER)) {
      if (order.userId === userId) {
        // Customers can only cancel or refund their own orders
        if (action === 'cancel' || action === 'refund') return;
        // Customers can only view their own orders
        if (action === 'view') return;
      }
    }

    throw new ForbiddenException(`You do not have permission to ${action} this order`);
  }

  private orderHasSupplierProducts(
    order: OrderDomainEntity,
    supplierId?: string
  ): boolean {
    // Implement logic to check if order contains supplier's products
    // This would require checking order items against product supplierId
    // For now, return false - implement based on your data model
    return false;
  }

  // ... rest of the existing methods (calculateOrderTotals, etc.)
}