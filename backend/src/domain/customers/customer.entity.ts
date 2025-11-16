import { CustomerModel, CustomerAddress } from './types/customer.type';
import { CreateCustomerDto, UpdateCustomerDto } from './types/customer.dto'

export class Customer implements CustomerModel {
  constructor(
    public id: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public phone?: string,
    public address?: CustomerAddress,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public isActive: boolean = true
  ) { }

  // Business methods
  static create(createDto: CreateCustomerDto): Customer {
    return new Customer(
      '', // ID autogenerate in DB 
      createDto.email,
      createDto.firstName,
      createDto.lastName,
      createDto.phone,
      createDto.address
    );
  }

  update(updateDto: UpdateCustomerDto): void {
    if (updateDto.firstName) this.firstName = updateDto.firstName;
    if (updateDto.lastName) this.lastName = updateDto.lastName;
    if (updateDto.phone !== undefined) this.phone = updateDto.phone;
    if (updateDto.address) this.address = { ...this.address, ...updateDto.address };
    if (updateDto.isActive !== undefined) this.isActive = updateDto.isActive;

    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}