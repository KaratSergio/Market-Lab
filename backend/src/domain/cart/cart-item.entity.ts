import { CartItemModel } from './types';

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