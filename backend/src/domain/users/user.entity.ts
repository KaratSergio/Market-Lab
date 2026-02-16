import {
  CreateUserDto, UpdateUserDto, RegisterUserDto,
  UserModel, UserRole, UserStatus,
  USER_ROLES, USER_STATUS
} from './types';

export class UserDomainEntity implements UserModel {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string | null,
    public roles: UserRole[] = [USER_ROLES.CUSTOMER],
    public status: UserStatus = USER_STATUS.ACTIVE,
    public emailVerified: boolean = false,
    public regComplete: boolean = false,
    public googleId?: string,
    public lastLoginAt?: Date,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }

  static create(createDto: CreateUserDto): UserDomainEntity {
    return new UserDomainEntity(
      crypto.randomUUID(),
      createDto.email,
      null,
      createDto.roles,
      USER_STATUS.ACTIVE,
      false,
      false,
    );
  }

  static register(registerDto: RegisterUserDto): UserDomainEntity {
    return new UserDomainEntity(
      crypto.randomUUID(),
      registerDto.email,
      null,
      [registerDto.role],
      USER_STATUS.ACTIVE,
      false,
      false,
    );
  }

  completeRegistration(roles: UserRole[] = []): void {
    this.regComplete = true;
    if (roles.length > 0) this.roles = roles;
    this.updatedAt = new Date();
  }

  update(updateDto: UpdateUserDto): void {
    if (updateDto.email) this.email = updateDto.email;
    if (updateDto.passwordHash) this.passwordHash = updateDto.passwordHash;
    if (updateDto.roles) this.roles = updateDto.roles;
    if (updateDto.status) this.status = updateDto.status as UserStatus;
    if (updateDto.emailVerified !== undefined) this.emailVerified = updateDto.emailVerified;
    if (updateDto.lastLoginAt) this.lastLoginAt = updateDto.lastLoginAt;

    this.updatedAt = new Date();
  }

  addRole(role: UserRole): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  removeRole(role: UserRole): void {
    const index = this.roles.indexOf(role);
    if (index > -1) {
      this.roles.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }

  isCustomer(): boolean {
    return this.hasRole(USER_ROLES.CUSTOMER);
  }

  isSupplier(): boolean {
    return this.hasRole(USER_ROLES.SUPPLIER);
  }

  isAdmin(): boolean {
    return this.hasRole(USER_ROLES.ADMIN);
  }

  activate(): void {
    this.status = USER_STATUS.ACTIVE;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = USER_STATUS.INACTIVE;
    this.updatedAt = new Date();
  }

  suspend(): void {
    this.status = USER_STATUS.SUSPENDED;
    this.updatedAt = new Date();
  }

  markEmailVerified(): void {
    this.emailVerified = true;
    this.updatedAt = new Date();
  }

  recordLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  canLogin(): boolean {
    return this.status === USER_STATUS.ACTIVE && this.emailVerified;
  }
}