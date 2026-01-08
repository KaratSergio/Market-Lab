import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@auth/auth.module';
import { OrderModule } from './order.module';

// ORM Entities
import { PaymentOrmEntity } from '@infrastructure/database/postgres/payment/payment.entity';

// Repositories
import { PostgresPaymentRepository } from '@infrastructure/database/postgres/payment/payment.repository';

// Domain Services
import { PaymentService } from '@domain/payment/payment.service';

// Controllers
import { PaymentController } from '@controller/payment/payment.controller';
import { PaymentWebhookController } from '@controller/payment/payment-webhook.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrmEntity]),
    AuthModule,
    OrderModule,
  ],
  controllers: [PaymentController, PaymentWebhookController],
  providers: [
    PaymentService,
    {
      provide: 'PaymentRepository',
      useClass: PostgresPaymentRepository,
    },
  ],
  exports: [
    PaymentService,
  ],
})
export class PaymentModule { }