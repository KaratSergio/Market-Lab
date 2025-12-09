import {
  OrderModel,
  OrderItemModel,
  OrderStatus,
  OrderTotalsDto,
  CreateOrderDto,
  PaymentStatus,
  ShippingAddress,
  ORDER_STATUS,
  PAYMENT_STATUS
} from './types';

export class OrderItem implements OrderItemModel {
  constructor(
    public productId: string,
    public name: string,
    public quantity: number,
    public price: number,
    public totalPrice: number,
    public imageUrl?: string
  ) { }
}

export class OrderDomainEntity implements OrderModel {
  public id: string;
  public userId: string;
  public cartId: string;
  public orderNumber: string;
  public items: OrderItem[] = [];
  public subtotal: number = 0;
  public shippingFee: number = 0;
  public taxAmount: number = 0;
  public discountAmount: number = 0;
  public totalAmount: number = 0;
  public currency: string;
  public status: OrderStatus;
  public paymentStatus: PaymentStatus;
  public shippingAddress: ShippingAddress;
  public notes?: string;
  public createdAt: Date;
  public updatedAt: Date;
  public transactionId?: string;

  constructor(data: {
    id?: string;
    userId: string;
    cartId: string;
    orderNumber: string;
    shippingAddress: ShippingAddress;
    currency?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    items?: OrderItem[];
    subtotal?: number;
    shippingFee?: number;
    taxAmount?: number;
    discountAmount?: number;
    totalAmount?: number;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id || '';
    this.userId = data.userId;
    this.cartId = data.cartId;
    this.orderNumber = data.orderNumber;
    this.shippingAddress = data.shippingAddress;
    this.currency = data.currency || 'USD';
    this.status = data.status || ORDER_STATUS.PENDING;
    this.paymentStatus = data.paymentStatus || PAYMENT_STATUS.PENDING;
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.shippingFee = data.shippingFee || 0;
    this.taxAmount = data.taxAmount || 0;
    this.discountAmount = data.discountAmount || 0;
    this.totalAmount = data.totalAmount || 0;
    this.notes = data.notes;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static create(
    createDto: CreateOrderDto,
    items: OrderItemModel[],
    totals: OrderTotalsDto
  ): OrderDomainEntity {
    const orderItems = items.map(item =>
      new OrderItem(
        item.productId,
        item.name || 'Product',
        item.quantity,
        item.price,
        item.totalPrice || item.price * item.quantity,
        item.imageUrl
      )
    );

    return new OrderDomainEntity({
      userId: createDto.userId,
      cartId: createDto.cartId,
      orderNumber: this.generateOrderNumber(),
      shippingAddress: createDto.shippingAddress,
      items: orderItems,
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountAmount,
      totalAmount: totals.totalAmount,
      notes: createDto.notes,
      status: ORDER_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING
    });
  }

  private static generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  updateStatus(newStatus: OrderStatus, notes?: string): void {
    const validTransitions = this.getValidStatusTransitions();

    if (!validTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;
    if (notes) this.notes = notes;
    this.updatedAt = new Date();
  }

  updatePaymentStatus(newStatus: PaymentStatus, transactionId?: string): void {
    this.paymentStatus = newStatus;
    if (transactionId) this.transactionId = transactionId;
    this.updatedAt = new Date();
  }

  cancel(reason?: string): void {
    if (this.status === ORDER_STATUS.DELIVERED) {
      throw new Error('Cannot cancel delivered order');
    }

    if (this.paymentStatus === PAYMENT_STATUS.PAID) {
      // If paid, we initiate a refund.
      this.paymentStatus = PAYMENT_STATUS.REFUNDED;
    }

    this.status = ORDER_STATUS.CANCELLED;
    if (reason) this.notes = reason;
    this.updatedAt = new Date();
  }

  markAsPaid(transactionId: string): void {
    this.paymentStatus = PAYMENT_STATUS.PAID;
    this.transactionId = transactionId;

    // change the order status to processing after payment.
    if (this.status === ORDER_STATUS.PENDING) {
      this.status = ORDER_STATUS.PROCESSING;
    }

    this.updatedAt = new Date();
  }

  calculateRefundAmount(): number {
    if (this.status === ORDER_STATUS.SHIPPED || this.status === ORDER_STATUS.DELIVERED) {
      // ! Возвращаем только стоимость товаров, доставка не возвращается
      return this.subtotal - this.discountAmount;
    }
    return this.totalAmount;
  }

  isRefundable(): boolean {
    return this.paymentStatus === PAYMENT_STATUS.PAID &&
      this.status !== ORDER_STATUS.REFUNDED &&
      this.status !== ORDER_STATUS.CANCELLED;
  }

  isCancellable(): boolean {
    return this.status === ORDER_STATUS.PENDING ||
      this.status === ORDER_STATUS.PROCESSING;
  }

  private getValidStatusTransitions(): OrderStatus[] {
    const transitions = {
      [ORDER_STATUS.PENDING]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
      [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.REFUNDED],
      [ORDER_STATUS.CANCELLED]: [],
      [ORDER_STATUS.REFUNDED]: [],
    };

    return transitions[this.status] || [];
  }
}

interface OrderTotals {
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}