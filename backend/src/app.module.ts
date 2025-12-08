import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuperAdminInitializerService } from './system/scripts/super-admin-initializer.service';

// System Modules
import { DatabaseModule } from '@system/database.module';

// Feature Modules
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@module/users.module';
import { CustomersModule } from '@module/customers.module';
import { SuppliersModule } from '@module/suppliers.module';
import { ProductModule } from '@module/product.module';
import { AdminModule } from '@module/admin.module';
import { CartModule } from '@module/cart.module';

// ORM Entities
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { AdminOrmEntity } from '@infrastructure/database/postgres/admin/admin.entity';
import { CartOrmEntity } from '@infrastructure/database/postgres/cart/cart.entity';
import { CartItemOrmEntity } from '@infrastructure/database/postgres/cart/cart-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

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

    // TypeORM entities for SuperAdminInitializerService
    TypeOrmModule.forFeature([
      UserOrmEntity,
      AdminOrmEntity,
      CartOrmEntity,
      CartItemOrmEntity
    ]),
  ],
  providers: [SuperAdminInitializerService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly superAdminInitializer: SuperAdminInitializerService,
  ) { }

  async onModuleInit() {
    // Initialize the super-admin when the application starts
    await this.superAdminInitializer.initializeSuperAdmin();
  }
}