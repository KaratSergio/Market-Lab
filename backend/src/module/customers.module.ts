import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from '@domain/customers/customer.service';
import { CustomersController } from '@controller/customers.controller';
import { CustomerEntity } from '@infrastructure/database/postgres/customers/customer.entity';
import { PostgresCustomerRepository } from '@infrastructure/database/postgres/customers/customer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
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