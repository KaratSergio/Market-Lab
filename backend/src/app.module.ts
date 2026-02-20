import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Script initial first user (super admin)
import { SuperAdminInitService } from './system/scripts/super-admin.init';

// System Modules
import { DatabaseModule } from '@system/database.module';

// OAuth google config
import googleOAuthConfig from '@infrastructure/oauth/google/google-oauth.config';

// Feature Modules
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@module/users.module';
import { CustomersModule } from '@module/customers.module';
import { SuppliersModule } from '@module/suppliers.module';
import { ProductModule } from '@module/product.module';
import { AdminModule } from '@module/admin.module';
import { CartModule } from '@module/cart.module';
import { OrderModule } from '@module/order.module';
import { PaymentModule } from '@module/payment.module';

// ORM Entities
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { AdminOrmEntity } from '@infrastructure/database/postgres/admin/admin.entity';
import { CartOrmEntity } from '@infrastructure/database/postgres/cart/cart.entity';
import { CartItemOrmEntity } from '@infrastructure/database/postgres/cart/cart-item.entity';
import { OrderOrmEntity } from '@infrastructure/database/postgres/order/order.entity';
import { OrderItemOrmEntity } from '@infrastructure/database/postgres/order/order-item.entity';
import { PaymentOrmEntity } from '@infrastructure/database/postgres/payment/payment.entity';

// Health Check
import { HealthController } from '@controller/health.controller';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [googleOAuthConfig],
    }),

    // Database
    DatabaseModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    CustomersModule,
    SuppliersModule,
    ProductModule,
    AdminModule,
    CartModule,
    OrderModule,
    PaymentModule,

    // TypeORM entities for SuperAdminInitializerService
    TypeOrmModule.forFeature([
      UserOrmEntity,
      AdminOrmEntity,
      CartOrmEntity,
      CartItemOrmEntity,
      OrderOrmEntity,
      OrderItemOrmEntity,
      PaymentOrmEntity
    ]),
  ],
  controllers: [HealthController],
  providers: [SuperAdminInitService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly superAdminInitializer: SuperAdminInitService,
  ) { }

  async onModuleInit() {
    // Initialize the super-admin when the application starts
    await this.superAdminInitializer.initializeSuperAdmin();
  }
}