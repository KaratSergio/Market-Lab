import { CreateCustomerDto, UpdateCustomerDto, CustomerRole, CustomerModel, CustomerAddress, CUSTOMER_DEFAULTS } from './types';

export class CustomerDomainEntity implements CustomerModel {
  constructor(
    public id: string,
    public email: string,
    public password: string,
    public firstName: string,
    public lastName: string,
    public roles: CustomerRole[] = CUSTOMER_DEFAULTS.ROLES,
    public phone?: string,
    public address?: CustomerAddress,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public isActive: boolean = CUSTOMER_DEFAULTS.IS_ACTIVE
  ) { }

  // Business methods
  static create(createDto: CreateCustomerDto): CustomerDomainEntity {
    return new CustomerDomainEntity(
      '', // ID autogenerate in DB 
      createDto.email,
      createDto.password,
      createDto.firstName,
      createDto.lastName,
      CUSTOMER_DEFAULTS.ROLES,
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

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // for ROLES
  addRole(role: CustomerRole): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  removeRole(role: CustomerRole): void {
    const index = this.roles.indexOf(role);
    if (index > -1) {
      this.roles.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  hasRole(role: CustomerRole): boolean {
    return this.roles.includes(role);
  }
}