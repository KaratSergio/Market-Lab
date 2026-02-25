import { CartItem } from './cart-item.entity';
import {
  CreateCartDto, CartModel,
  CartStatus, CART_STATUS,
  CartOwnerType, CART_OWNER_TYPE
} from './types';


export class CartDomainEntity implements CartModel {
  items: CartItem[] = [];
  totalAmount = 0;
  discountAmount = 0;
  finalAmount = 0;
  expiresAt: Date;

  constructor(
    public id: string,
    public userId: string | null | undefined,
    public sessionId: string | null | undefined,
    public ownerType: CartOwnerType,
    public currency: string = 'UAH',
    public status: CartStatus = CART_STATUS.ACTIVE,
    items: CartItem[] = [],
    expiresAt?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    this.items = items;
    this.expiresAt = expiresAt ?? this.getDefaultExpiry();
    this.calculateTotals();
  }

  private getDefaultExpiry(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }

  static create(createDto: CreateCartDto): CartDomainEntity {
    const ownerType = createDto.userId ? CART_OWNER_TYPE.USER : CART_OWNER_TYPE.GUEST;

    const items = createDto.items?.map(item => new CartItem(
      item.productId,
      item.quantity,
      item.price,
      item.discount,
      item.name,
      item.imageUrl
    )) || [];

    return new CartDomainEntity(
      crypto.randomUUID(),
      createDto.userId,
      createDto.sessionId,
      ownerType,
      createDto.currency || 'UAH',
      CART_STATUS.ACTIVE,
      items
    );
  }

  merge(guestCart: CartDomainEntity): void {
    guestCart.items.forEach(guestItem => {
      const existingItem = this.items.find(item => item.productId === guestItem.productId);
      if (existingItem) existingItem.updateQuantity(Math.max(existingItem.quantity, guestItem.quantity));
      else this.items.push(guestItem);
    });

    if (this.ownerType === CART_OWNER_TYPE.GUEST && guestCart.ownerType === CART_OWNER_TYPE.USER) {
      this.userId = guestCart.userId;
      this.sessionId = null;
      this.ownerType = CART_OWNER_TYPE.USER;
    }

    this.calculateTotals();
    this.updatedAt = new Date();
  }

  addItem(productId: string, quantity: number, price: number, name: string, imageUrl?: string): void {
    const existingItem = this.items.find(item => item.productId === productId);
    if (existingItem) existingItem.updateQuantity(existingItem.quantity + quantity);
    else this.items.push(new CartItem(productId, quantity, price, 0, name, imageUrl));

    this.calculateTotals();
    this.updatedAt = new Date();
  }

  updateItemQuantity(productId: string, quantity: number): void {
    const item = this.items.find(item => item.productId === productId);
    if (!item) throw new Error('Item not found in cart');

    if (quantity === 0) {
      this.removeItem(productId);
      return;
    }

    item.updateQuantity(quantity);
    this.calculateTotals();
    this.updatedAt = new Date();
  }

  removeItem(productId: string): void {
    const index = this.items.findIndex(item => item.productId === productId);
    if (index > -1) {
      this.items.splice(index, 1);
      this.calculateTotals();
      this.updatedAt = new Date();
    }
  }

  applyDiscount(discountAmount: number): void {
    if (discountAmount < 0) throw new Error('Discount cannot be negative');
    if (discountAmount > this.totalAmount) throw new Error('Discount cannot exceed total amount');

    this.discountAmount = discountAmount;
    this.calculateTotals();
    this.updatedAt = new Date();
  }

  clear(): void {
    this.items = [];
    this.totalAmount = 0;
    this.discountAmount = 0;
    this.finalAmount = 0;
    this.updatedAt = new Date();
  }

  markAsPendingCheckout(): void {
    this.status = CART_STATUS.PENDING_CHECKOUT;
    this.updatedAt = new Date();
  }

  markAsConvertedToOrder(): void {
    this.status = CART_STATUS.CONVERTED_TO_ORDER;
    this.updatedAt = new Date();
  }

  isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  private calculateTotals(): void {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.finalAmount = Math.max(0, this.totalAmount - this.discountAmount);
  }
}