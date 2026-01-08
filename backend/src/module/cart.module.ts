import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Auth
import { AuthModule } from '@auth/auth.module';

// ORM Entities
import { CartOrmEntity } from '@infrastructure/database/postgres/cart/cart.entity';
import { CartItemOrmEntity } from '@infrastructure/database/postgres/cart/cart-item.entity';

// Repositories
import { PostgresCartRepository } from '@infrastructure/database/postgres/cart/cart.repository';

// Domain Services
import { CartService } from '@domain/cart/cart.service';

// Controller
import { CartController } from '@controller/cart.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([CartOrmEntity, CartItemOrmEntity]),
    AuthModule,
  ],
  controllers: [CartController],
  providers: [
    // Main cart service
    CartService,

    // Cart repository
    {
      provide: 'CartRepository',
      useClass: PostgresCartRepository,
    },
  ],
  exports: [
    CartService,
  ],
})
export class CartModule { }