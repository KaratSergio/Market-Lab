import {
  OrderModel,
  OrderItemModel,
  OrderStatus,
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
    public unitPrice: number,
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

  constructor(
    id: string,
    userId: string,
    cartId: string,
    orderNumber: string,
    shippingAddress: ShippingAddress,
    currency: string = 'USD',
    status: OrderStatus = ORDER_STATUS.PENDING,
    paymentStatus: PaymentStatus = PAYMENT_STATUS.PENDING,
    items: OrderItem[] = [],
    subtotal: number = 0,
    shippingFee: number = 0,
    taxAmount: number = 0,
    discountAmount: number = 0,
    totalAmount: number = 0,
    notes?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.cartId = cartId;
    this.orderNumber = orderNumber;
    this.shippingAddress = shippingAddress;
    this.currency = currency;
    this.status = status;
    this.paymentStatus = paymentStatus;
    this.items = items;
    this.subtotal = subtotal;
    this.shippingFee = shippingFee;
    this.taxAmount = taxAmount;
    this.discountAmount = discountAmount;
    this.totalAmount = totalAmount;
    this.notes = notes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(createDto: CreateOrderDto, items: OrderItem[], totals: OrderTotals): OrderDomainEntity {
    const orderNumber = this.generateOrderNumber();

    return new OrderDomainEntity(
      crypto.randomUUID(),
      createDto.userId,
      createDto.cartId,
      orderNumber,
      createDto.shippingAddress,
      'USD',
      ORDER_STATUS.PENDING,
      PAYMENT_STATUS.PENDING,
      items,
      totals.subtotal,
      totals.shippingFee,
      totals.taxAmount,
      totals.discountAmount,
      totals.totalAmount,
      createDto.notes
    );
  }

  private static generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random.toString().padStart(3, '0')}`;
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