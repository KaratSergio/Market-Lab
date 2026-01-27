import { LanguageCode, TranslatableProductFields } from '@domain/translations/types';

import {
  CreateSupplierDto, UpdateSupplierDto,
  SupplierModel, SupplierStatus, SUPPLIER_STATUS
} from './types';


export class SupplierDomainEntity implements SupplierModel {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public companyName: string,
    public registrationNumber: string,
    public phone: string,
    public firstName: string,
    public lastName: string,
    public description: string,
    public documents: string[] = [],
    public status: SupplierStatus = SUPPLIER_STATUS.PENDING,
    public translations?: Partial<Record<LanguageCode, Partial<Record<TranslatableProductFields, string>>>>,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }

  static create(createDto: CreateSupplierDto): SupplierDomainEntity {
    return new SupplierDomainEntity(
      crypto.randomUUID(),
      createDto.userId,
      createDto.companyName,
      createDto.registrationNumber,
      createDto.phone,
      createDto.firstName,
      createDto.lastName,
      createDto.description,
      createDto.documents ?? [],
      SUPPLIER_STATUS.PENDING
    );
  }

  update(updateDto: UpdateSupplierDto): void {
    if (updateDto.companyName !== undefined) this.companyName = updateDto.companyName;
    if (updateDto.registrationNumber !== undefined) this.registrationNumber = updateDto.registrationNumber;
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