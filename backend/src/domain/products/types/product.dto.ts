// Use it to type the incoming data
import { ProductStatus } from "./product.type";

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category?: string;
  images?: string[];
  stock?: number;
  status?: ProductStatus;
  tags?: string[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> { };

export interface PurchaseProductDto {
  quantity: number;
  shippingAddress?: string;
  paymentMethod?: string;
}

export interface RestockProductDto {
  quantity: number;
  reason?: string;
}