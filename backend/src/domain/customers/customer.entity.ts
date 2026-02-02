import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerModel,
  CustomerStatus,
  CUSTOMER_STATUS
} from './types';


export class CustomerDomainEntity implements CustomerModel {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public firstName: string,
    public lastName: string,
    public phone: string,
    public birthday: Date | null = null,
    public status: CustomerStatus = CUSTOMER_STATUS.ACTIVE,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }

  static create(createDto: CreateCustomerDto): CustomerDomainEntity {
    const birthday = createDto.birthday ? new Date(createDto.birthday) : null;

    return new CustomerDomainEntity(
      crypto.randomUUID(),
      createDto.userId,
      createDto.firstName,
      createDto.lastName,
      createDto.phone,
      birthday,
      CUSTOMER_STATUS.ACTIVE
    );
  }

  update(updateDto: UpdateCustomerDto): void {
    if (updateDto.firstName !== undefined) this.firstName = updateDto.firstName;
    if (updateDto.lastName !== undefined) this.lastName = updateDto.lastName;
    if (updateDto.phone !== undefined) this.phone = updateDto.phone;
    if (updateDto.birthday !== undefined) this.birthday = updateDto.birthday ? new Date(updateDto.birthday) : null;
    if (updateDto.status !== undefined) this.status = updateDto.status;

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