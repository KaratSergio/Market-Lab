import {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierModel,
  SupplierStatus,
  SUPPLIER_STATUS
} from './types';

import { Address } from '@shared/types';

export class SupplierDomainEntity implements SupplierModel {
  public id: string;
  public userId: string;
  public companyName: string;
  public registrationNumber: string;
  public address: Address;
  public email: string;
  public phone: string;
  public firstName: string;
  public lastName: string;
  public description: string;
  public documents: string[];
  public status: SupplierStatus;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    companyName: string,
    registrationNumber: string,
    address: Address,
    email: string,
    phone: string,
    firstName: string,
    lastName: string,
    description: string,
    documents: string[] = [],
    status: SupplierStatus = SUPPLIER_STATUS.PENDING,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.companyName = companyName;
    this.registrationNumber = registrationNumber;
    this.address = address;
    this.email = email;
    this.phone = phone;
    this.firstName = firstName;
    this.lastName = lastName;
    this.description = description;
    this.documents = documents;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(createDto: CreateSupplierDto): SupplierDomainEntity {
    return new SupplierDomainEntity(
      crypto.randomUUID(),
      createDto.userId,
      createDto.companyName,
      createDto.registrationNumber,
      createDto.address,
      createDto.email,
      createDto.phone,
      createDto.firstName,
      createDto.lastName,
      createDto.description,
      createDto.documents,
      SUPPLIER_STATUS.PENDING
    );
  }

  update(updateDto: UpdateSupplierDto): void {
    if (updateDto.companyName !== undefined) this.companyName = updateDto.companyName;
    if (updateDto.registrationNumber !== undefined) this.registrationNumber = updateDto.registrationNumber;
    if (updateDto.address !== undefined) this.address = updateDto.address;
    if (updateDto.email !== undefined) this.email = updateDto.email;
    if (updateDto.phone !== undefined) this.phone = updateDto.phone;
    if (updateDto.firstName !== undefined) this.firstName = updateDto.firstName;
    if (updateDto.lastName !== undefined) this.lastName = updateDto.lastName;
    if (updateDto.description !== undefined) this.description = updateDto.description;
    if (updateDto.documents !== undefined) this.documents = updateDto.documents;
    if (updateDto.status !== undefined) this.status = updateDto.status;

    this.updatedAt = new Date();
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

  isPending(): boolean {
    return this.status === SUPPLIER_STATUS.PENDING;
  }

  addDocument(document: string): void {
    this.documents.push(document);
    this.updatedAt = new Date();
  }

  removeDocument(document: string): void {
    const index = this.documents.indexOf(document);
    if (index > -1) {
      this.documents.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  hasContactInfo(): boolean {
    return !!(this.firstName || this.lastName || this.phone);
  }

  updateContactInfo(firstName: string, lastName: string, phone: string): void {
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.updatedAt = new Date();
  }
}