import { Controller, Get, Post, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthJwtGuard } from '@auth/guard/auth-jwt.guard';
import { PaymentService } from '@domain/payment/payment.service';
import type { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto } from '@domain/payment/types';

@Controller('payments')
@UseGuards(AuthJwtGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Get()
  async getUserPayments(@Req() req: { user: { id: string } }) {
    const userId = req.user.id;
    return this.paymentService.getUserPayments(userId);
  }

  @Get(':id')
  async getPaymentById(@Param('id') id: string) {
    return this.paymentService.getPaymentById(id);
  }

  @Get('order/:orderId')
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrderId(orderId);
  }

  @Post()
  async createPayment(@Req() req: { user: { id: string } }, @Body() createPaymentDto: CreatePaymentDto) {
    const userId = req.user.id;
    return this.paymentService.createPayment({
      ...createPaymentDto,
      userId,
    });
  }

  @Post(':id/process')
  async processPayment(
    @Param('id') id: string,
    @Body() processDto: ProcessPaymentDto,
  ) {
    return this.paymentService.processPayment(id, processDto);
  }

  @Post(':id/refund')
  async refundPayment(
    @Param('id') id: string,
    @Body() refundDto: RefundPaymentDto,
  ) {
    return this.paymentService.refundPayment(id, refundDto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelPayment(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.paymentService.cancelPayment(id, reason);
  }

  // Admin endpoints
  @Get('admin/pending')
  async getPendingPayments() {
    return this.paymentService.getPendingPayments();
  }

  @Get('admin/failed')
  async getFailedPayments() {
    return this.paymentService.getFailedPayments();
  }
}