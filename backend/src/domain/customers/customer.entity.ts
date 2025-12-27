import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerModel,
  CustomerStatus,
  CUSTOMER_STATUS
} from './types';

import { Address } from '@shared/types';

export class CustomerDomainEntity implements CustomerModel {
  public id: string;
  public userId: string;
  public firstName: string;
  public lastName: string;
  public phone: string;
  public birthday: Date | null;
  public status: CustomerStatus;
  public address?: Address;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    firstName: string,
    lastName: string,
    phone: string,
    birthday: Date | null = null,
    status: CustomerStatus = CUSTOMER_STATUS.ACTIVE,
    address?: Address,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.birthday = birthday;
    this.status = status;
    this.address = address;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(createDto: CreateCustomerDto): CustomerDomainEntity {
    const birthday = createDto.birthday ? new Date(createDto.birthday) : null;

    return new CustomerDomainEntity(
      crypto.randomUUID(),
      createDto.userId,
      createDto.firstName,
      createDto.lastName,
      createDto.phone,
      birthday,
      CUSTOMER_STATUS.ACTIVE,
      createDto.address
    );
  }

  update(updateDto: UpdateCustomerDto): void {
    if (updateDto.firstName) this.firstName = updateDto.firstName;
    if (updateDto.lastName) this.lastName = updateDto.lastName;
    if (updateDto.phone) this.phone = updateDto.phone;
    if (updateDto.birthday !== undefined) this.birthday = updateDto.birthday ? new Date(updateDto.birthday) : null;
    if (updateDto.address) this.address = { ...this.address, ...updateDto.address };
    if (updateDto.status) this.status = updateDto.status;

    this.updatedAt = new Date();
  }

  activate(): void {
    this.status = CUSTOMER_STATUS.ACTIVE;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = CUSTOMER_STATUS.INACTIVE;
    this.updatedAt = new Date();
  }

  // method for calculating age
  getAge(): number | undefined {
    if (!this.birthday) return undefined;

    const today = new Date();
    const birthDate = new Date(this.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}