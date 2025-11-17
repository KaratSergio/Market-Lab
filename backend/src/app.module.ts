import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';

// import { AuthModule } from '@auth/auth.module';
// import { ProductsModule } from '@module/product.module';
import { DatabaseModule } from '@system/database.module';
import { CustomersModule } from '@module/customers.module';
import { ProductModule } from '@module/product.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MongooseModule.forRoot(process.env.MONGO_URI || ''),

    // AuthModule,
    DatabaseModule,
    CustomersModule,
    ProductModule,
  ],
  providers: [],
})
export class AppModule { }
