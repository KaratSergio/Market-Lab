import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthJwtGuard } from '@auth/guard/auth-jwt.guard';
import { OrderService } from '@domain/order/order.service';
import type { CreateOrderDto, UpdateOrderStatusDto } from '@domain/order/types';
import type { CartItemModel } from '@domain/cart/types';


@Controller('orders')
@UseGuards(AuthJwtGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get()
  async getUserOrders(@Req() req: { user: { id: string } }) {
    const userId = req.user.id;
    return this.orderService.getUserOrders(userId);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Get('number/:orderNumber')
  async getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.orderService.getOrderByNumber(orderNumber);
  }

  @Post()
  async createOrder(
    @Req() req: { user: { id: string } },
    @Body() createOrderDto: CreateOrderDto
  ) {
    const userId = req.user.id;

    //! Тут має бути логіка отримання товарів із кошика та розрахунку вартості
    //! Для прикладу створюємо фіктивні дані

    const cartItems: CartItemModel[] = [];
    const totals = {
      subtotal: 100,
      shippingFee: 5,
      taxAmount: 10,
      discountAmount: 0,
      totalAmount: 115
    };

    return this.orderService.createOrder(
      { ...createOrderDto, userId },
      cartItems,
      totals
    );
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, updateStatusDto);
  }

  @Put(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.orderService.cancelOrder(id, reason);
  }

  @Post(':id/refund')
  async initiateRefund(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.orderService.initiateRefund(id, reason);
  }

  // Admin endpoints
  @Get('admin/stats')
  async getOrderStats() {
    return this.orderService.getOrderStats();
  }

  @Get('admin/pending')
  async getPendingOrders() {
    return this.orderService.findPendingOrders();
  }

  @Get('admin/unpaid')
  async getUnpaidOrders() {
    return this.orderService.findUnpaidOrders();
  }
}