import { CustomerDomainEntity } from '@domain/customers/customer.entity';
import { CreateSupplierDto, type SupplierStatus, SUPPLIER_STATUS } from './types';

export class SupplierEntity {
  constructor(
    public id: string,
    public customer: CustomerDomainEntity,
    public name: string,
    public email: string,
    public phone?: string,
    public documents?: string,
    public status: SupplierStatus = SUPPLIER_STATUS.PENDING,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) { }

  // Business methods
  static create(customer: CustomerDomainEntity, createDto: CreateSupplierDto): SupplierEntity {
    return new SupplierEntity(
      '', // ID autogenerate in DB
      customer,
      createDto.name,
      customer.email, //! customer email !!
      createDto.phone,
      createDto.documents,
      SUPPLIER_STATUS.PENDING // Default status
    );
  }

  approve(): void {
    this.status = SUPPLIER_STATUS.APPROVED;
    this.updatedAt = new Date();
  }

  reject(): void {
    this.status = SUPPLIER_STATUS.REJECTED;
    this.updatedAt = new Date();
  }

  suspend(): void {
    this.status = SUPPLIER_STATUS.SUSPENDED;
    this.updatedAt = new Date();
  }

  isActive(): boolean {
    return this.status === SUPPLIER_STATUS.APPROVED;
  }

  canSupply(): boolean {
    return this.status === SUPPLIER_STATUS.APPROVED;
  }
}