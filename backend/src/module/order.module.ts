import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@auth/auth.module';
import { CartModule } from './cart.module';

// ORM Entities
import { OrderOrmEntity } from '@infrastructure/database/postgres/order/order.entity';
import { OrderItemOrmEntity } from '@infrastructure/database/postgres/order/order-item.entity';

// Repositories
import { PostgresOrderRepository } from '@infrastructure/database/postgres/order/order.repository';

// Domain Services
import { OrderService } from '@domain/order/order.service';

// Controllers
import { OrderController } from '@controller/order.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([OrderOrmEntity, OrderItemOrmEntity]),
    AuthModule,
    CartModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: 'OrderRepository',
      useClass: PostgresOrderRepository,
    },
  ],
  exports: [
    OrderService,
  ],
})
export class OrderModule { }