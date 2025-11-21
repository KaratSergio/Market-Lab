import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from '@domain/customers/customer.service';
import { CustomersController } from '@controller/customers.controller';
import { CustomerOrmEntity } from '@infrastructure/database/postgres/customers/customer.entity';
import { PostgresCustomerRepository } from '@infrastructure/database/postgres/customers/customer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrmEntity])],
  controllers: [CustomersController],
  providers: [
    CustomerService,
    {
      provide: 'CustomerRepository',
      useClass: PostgresCustomerRepository,
    },
  ],
  exports: [CustomerService],
})
export class CustomersModule { }