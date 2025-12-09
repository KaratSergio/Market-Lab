import {
  CartModel,
  CartItemModel,
  CartStatus,
  CART_STATUS,
  CreateCartDto
} from './types';


export class CartItem implements CartItemModel {
  constructor(
    public productId: string,
    public quantity: number,
    public price: number,
    public discount: number = 0,
    public name: string,
    public imageUrl?: string
  ) { }

  get subtotal(): number {
    return (this.price - this.discount) * this.quantity;
  }

  updateQuantity(newQuantity: number): void {
    if (newQuantity < 1) throw new Error('Quantity must be at least 1');
    this.quantity = newQuantity;
  }

  applyDiscount(discount: number): void {
    if (discount < 0 || discount > this.price) throw new Error('Invalid discount amount');
    this.discount = discount;
  }
}

export class CartDomainEntity implements CartModel {
  public id: string;
  public userId: string;
  public items: CartItem[] = [];
  public totalAmount: number = 0;
  public discountAmount: number = 0;
  public finalAmount: number = 0;
  public currency: string;
  public status: CartStatus;
  public expiresAt?: Date;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    currency: string = 'USD',
    status: CartStatus = CART_STATUS.ACTIVE,
    items: CartItem[] = [],
    expiresAt?: Date,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.currency = currency;
    this.status = status;
    this.items = items;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.calculateTotals();
  }

  static create(createDto: CreateCartDto): CartDomainEntity {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days basket life

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
      createDto.currency || 'USD',
      CART_STATUS.ACTIVE,
      items,
      expiresAt
    );
  }

  addItem(productId: string, quantity: number, price: number, name: string, imageUrl?: string): void {
    const existingItem = this.items.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.updateQuantity(existingItem.quantity + quantity);
    } else {
      this.items.push(new CartItem(productId, quantity, price, 0, name, imageUrl));
    }

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