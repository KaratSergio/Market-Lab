import {
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';

import {
  IsString, IsNumber,
  IsOptional, IsUUID, Min,
  IsObject,
} from 'class-validator';


export class AddItemToCartDtoSwagger {
  @ApiProperty({
    description: 'Product ID to add to cart',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantity to add',
    example: 1,
    minimum: 1,
    required: true,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Product variant ID (if applicable)',
    example: 'variant_123',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({
    description: 'Additional options for the product',
    example: { color: 'red', size: 'M' },
  })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>;
}

export class UpdateCartItemDtoSwagger {
  @ApiProperty({
    description: 'New quantity for the item',
    example: 3,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Update product variant (if changing)',
    example: 'variant_456',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({
    description: 'Update product options',
    example: { color: 'blue', size: 'L' },
  })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>;
}

export class ApplyDiscountDtoSwagger {
  @ApiProperty({
    description: 'Discount code to apply',
    example: 'SUMMER2024',
    required: true,
  })
  @IsString()
  code: string;
}

// Response DTOs
export class CartItemResponseDtoSwagger {
  @ApiProperty({
    description: 'Cart item ID',
    example: 'cart_item_123',
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Gaming Laptop Pro',
  })
  productName: string;

  @ApiProperty({
    description: 'Product SKU',
    example: 'LAP-GAM-PRO-001',
  })
  sku: string;

  @ApiProperty({
    description: 'Product price per unit',
    example: 1499.99,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Quantity in cart',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Total price for this item (quantity * unitPrice)',
    example: 2999.98,
  })
  totalPrice: number;

  @ApiPropertyOptional({
    description: 'Product variant information',
    example: { color: 'black', storage: '1TB' },
  })
  variant?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Product options',
    example: { warranty: '2 years', accessories: ['mouse', 'bag'] },
  })
  options?: Record<string, any>;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://storage.example.com/images/laptop.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Supplier ID',
    example: 'supplier_123',
  })
  supplierId: string;

  @ApiProperty({
    description: 'Supplier name',
    example: 'Tech Solutions Inc.',
  })
  supplierName: string;

  @ApiProperty({
    description: 'Item added date',
    example: '2024-06-20T14:45:00.000Z',
  })
  addedAt: Date;
}

export class CartResponseDtoSwagger {
  @ApiProperty({
    description: 'Cart ID',
    example: 'cart_123456',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns the cart',
    example: 'user_123',
  })
  userId: string;

  @ApiProperty({
    description: 'Cart status',
    example: 'active',
    enum: ['active', 'pending_checkout', 'converted', 'abandoned', 'expired'],
  })
  status: string;

  @ApiProperty({
    description: 'Items in the cart',
    type: [CartItemResponseDtoSwagger],
  })
  items: CartItemResponseDtoSwagger[];

  @ApiProperty({
    description: 'Number of unique items in cart',
    example: 3,
  })
  itemCount: number;

  @ApiProperty({
    description: 'Total quantity of all items',
    example: 5,
  })
  totalQuantity: number;

  @ApiProperty({
    description: 'Subtotal (sum of all item prices before discounts/taxes)',
    example: 4499.97,
  })
  subtotal: number;

  @ApiPropertyOptional({
    description: 'Applied discount amount',
    example: 224.99,
  })
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Applied discount code',
    example: 'SUMMER2024',
  })
  discountCode?: string;

  @ApiProperty({
    description: 'Tax amount',
    example: 449.99,
  })
  taxAmount: number;

  @ApiProperty({
    description: 'Shipping cost',
    example: 9.99,
  })
  shippingCost: number;

  @ApiProperty({
    description: 'Grand total (subtotal - discount + tax + shipping)',
    example: 4734.96,
  })
  grandTotal: number;

  @ApiProperty({
    description: 'Cart expiration date',
    example: '2024-06-27T14:45:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Cart creation date',
    example: '2024-06-20T14:45:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-06-20T15:30:00.000Z',
  })
  updatedAt: Date;
}

export class CartCheckoutResponseDtoSwagger {
  @ApiProperty({
    description: 'Cart ID',
    example: 'cart_123456',
  })
  cartId: string;

  @ApiProperty({
    description: 'Checkout ready status',
    example: true,
  })
  readyForCheckout: boolean;

  @ApiProperty({
    description: 'Validated items count',
    example: 3,
  })
  validatedItems: number;

  @ApiPropertyOptional({
    description: 'Validation warnings',
    example: ['Product "Wireless Mouse" has limited stock (2 available)'],
    type: [String],
  })
  warnings?: string[];

  @ApiPropertyOptional({
    description: 'Validation errors',
    example: ['Product "Gaming Chair" is out of stock'],
    type: [String],
  })
  errors?: string[];

  @ApiProperty({
    description: 'Reserved stock status',
    example: true,
  })
  stockReserved: boolean;

  @ApiProperty({
    description: 'Checkout session token',
    example: 'checkout_session_abc123',
  })
  sessionToken: string;

  @ApiProperty({
    description: 'Checkout session expiration',
    example: '2024-06-20T16:45:00.000Z',
  })
  sessionExpiresAt: Date;
}

export class ExpiredCartsResponseDtoSwagger {
  @ApiProperty({
    description: 'Total expired carts count',
    example: 25,
  })
  totalExpired: number;

  @ApiProperty({
    description: 'Expired carts data',
    type: [CartResponseDtoSwagger],
  })
  carts: CartResponseDtoSwagger[];

  @ApiProperty({
    description: 'Potential lost revenue from expired carts',
    example: 12500.75,
  })
  potentialLostRevenue: number;

  @ApiProperty({
    description: 'Average time carts were active before expiring',
    example: '3 days, 5 hours',
  })
  averageActiveTime: string;

  @ApiProperty({
    description: 'Most common abandonment stage',
    example: 'checkout_page',
  })
  mostCommonAbandonmentStage: string;
}

export class SupplierCartStatsResponseDtoSwagger {
  @ApiProperty({
    description: 'Supplier ID',
    example: 'supplier_123',
  })
  supplierId: string;

  @ApiProperty({
    description: 'Supplier company name',
    example: 'Tech Solutions Inc.',
  })
  companyName: string;

  @ApiProperty({
    description: 'Number of supplier products in active carts',
    example: 45,
  })
  productsInActiveCarts: number;

  @ApiProperty({
    description: 'Number of unique customers with supplier products in cart',
    example: 32,
  })
  uniqueCustomers: number;

  @ApiProperty({
    description: 'Total potential revenue from supplier products in carts',
    example: 12500.50,
  })
  potentialRevenue: number;

  @ApiProperty({
    description: 'Most popular products currently in carts',
    example: [
      { productId: 'prod_123', name: 'Gaming Laptop', quantity: 15, potentialRevenue: 22499.85 },
      { productId: 'prod_456', name: 'Wireless Mouse', quantity: 30, potentialRevenue: 899.70 },
    ],
  })
  popularProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    potentialRevenue: number;
  }>;

  @ApiProperty({
    description: 'Cart statistics by time period',
    example: {
      last24Hours: { carts: 12, revenue: 2999.99 },
      last7Days: { carts: 45, revenue: 11250.25 },
      last30Days: { carts: 180, revenue: 45000.00 },
    },
  })
  timePeriodStats: Record<string, { carts: number; revenue: number }>;
}

export class SuccessResponseDtoSwagger {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Response data',
  })
  data?: any;
}

export class CartOperationResponseDtoSwagger {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Operation message',
    example: 'Item added to cart successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated cart',
    type: CartResponseDtoSwagger,
  })
  cart: CartResponseDtoSwagger;

  @ApiPropertyOptional({
    description: 'Affected item details',
  })
  affectedItem?: {
    productId: string;
    productName: string;
    quantity: number;
    action: 'added' | 'updated' | 'removed';
  };
}