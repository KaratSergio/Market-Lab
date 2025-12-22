import {
  CreateAdminDto,
  UpdateAdminDto,
  AdminModel,
  AdminStatus,
  ADMIN_STATUS
} from './types';
import { Role } from '@shared/types';


export class AdminDomainEntity implements AdminModel {
  public id: string;
  public userId: string;
  public firstName: string;
  public lastName: string;
  public phone: string;
  public roles: Role[];
  public status: AdminStatus;
  public department?: string;
  public lastActiveAt?: Date;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    firstName: string,
    lastName: string,
    phone: string,
    roles: Role[] = [Role.ADMIN],
    status: AdminStatus = ADMIN_STATUS.ACTIVE,
    department?: string,
    lastActiveAt?: Date,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.roles = roles;
    this.status = status;
    this.department = department;
    this.lastActiveAt = lastActiveAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(createDto: CreateAdminDto): AdminDomainEntity {
    return new AdminDomainEntity(
      crypto.randomUUID(),
      createDto.userId,
      createDto.firstName,
      createDto.lastName,
      createDto.phone || '',
      createDto.roles || [Role.ADMIN],
      ADMIN_STATUS.ACTIVE,
      createDto.department
    );
  }

  update(updateDto: UpdateAdminDto): void {
    if (updateDto.firstName) this.firstName = updateDto.firstName;
    if (updateDto.lastName) this.lastName = updateDto.lastName;
    if (updateDto.roles) this.roles = updateDto.roles;
    if (updateDto.status) this.status = updateDto.status;
    if (updateDto.department !== undefined) this.department = updateDto.department;
    if (updateDto.lastActiveAt) this.lastActiveAt = updateDto.lastActiveAt;

    this.updatedAt = new Date();
  }

  // Role management
  isSuperAdmin(): boolean {
    return this.hasRole(Role.SUPER_ADMIN);
  }

  isAdmin(): boolean {
    return this.hasRole(Role.ADMIN);
  }

  isModerator(): boolean {
    return this.hasRole(Role.MODERATOR);
  }

  // Status management
  activate(): void {
    this.status = ADMIN_STATUS.ACTIVE;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = ADMIN_STATUS.INACTIVE;
    this.updatedAt = new Date();
  }

  suspend(): void {
    this.status = ADMIN_STATUS.SUSPENDED;
    this.updatedAt = new Date();
  }

  // Activity tracking
  recordActivity(): void {
    this.lastActiveAt = new Date();
    this.updatedAt = new Date();
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Role methods
  hasRole(role: Role): boolean {
    return this.roles.includes(role);
  }

  addRole(role: Role): void {
    if (!this.hasRole(role)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  removeRole(role: Role): void {
    if (this.hasRole(role)) {
      this.roles = this.roles.filter(r => r !== role);
      this.updatedAt = new Date();
    }
  }

  getPrimaryRole(): Role {
    if (this.hasRole(Role.SUPER_ADMIN)) return Role.SUPER_ADMIN;
    if (this.hasRole(Role.ADMIN)) return Role.ADMIN;
    if (this.hasRole(Role.MODERATOR)) return Role.MODERATOR;
    if (this.hasRole(Role.SUPPLIER)) return Role.SUPPLIER;
    if (this.hasRole(Role.CUSTOMER)) return Role.CUSTOMER;
    return Role.GUEST;
  }
}