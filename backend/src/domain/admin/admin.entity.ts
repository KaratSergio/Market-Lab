import {
  CreateAdminDto,
  UpdateAdminDto,
  AdminModel,
  AdminRole,
  AdminStatus,
  AdminPermissions,
  ADMIN_ROLES,
  ADMIN_STATUS
} from './types';

export class AdminDomainEntity implements AdminModel {
  public id: string;
  public userId: string;
  public firstName: string;
  public lastName: string;
  public phone: string;
  public role: AdminRole;
  public status: AdminStatus;
  public permissions: AdminPermissions;
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
    role: AdminRole = ADMIN_ROLES.ADMIN,
    status: AdminStatus = ADMIN_STATUS.ACTIVE,
    permissions: AdminPermissions = AdminDomainEntity.getDefaultPermissions(role),
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
    this.role = role;
    this.status = status;
    this.permissions = permissions;
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
      createDto.role,
      ADMIN_STATUS.ACTIVE,
      AdminDomainEntity.getDefaultPermissions(createDto.role, createDto.permissions),
      createDto.department
    );
  }

  private static getDefaultPermissions(
    role: AdminRole,
    customPermissions?: Partial<AdminPermissions>
  ): AdminPermissions {
    const basePermissions: AdminPermissions = {
      canManageUsers: false,
      canManageProducts: false,
      canManageOrders: false,
      canManageContent: false,
      canViewAnalytics: false,
      canManageSystem: false,
    };

    const rolePermissions: Record<AdminRole, Partial<AdminPermissions>> = {
      [ADMIN_ROLES.SUPER_ADMIN]: {
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageContent: true,
        canViewAnalytics: true,
        canManageSystem: true,
      },
      [ADMIN_ROLES.ADMIN]: {
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageContent: true,
        canViewAnalytics: true,
        canManageSystem: false,
      },
      [ADMIN_ROLES.MODERATOR]: {
        canManageUsers: false,
        canManageProducts: true,
        canManageOrders: true,
        canManageContent: true,
        canViewAnalytics: true,
        canManageSystem: false,
      },
      [ADMIN_ROLES.SUPPORT]: {
        canManageUsers: false,
        canManageProducts: false,
        canManageOrders: true,
        canManageContent: false,
        canViewAnalytics: false,
        canManageSystem: false,
      },
    };

    return {
      ...basePermissions,
      ...rolePermissions[role],
      ...customPermissions,
    };
  }

  update(updateDto: UpdateAdminDto): void {
    if (updateDto.firstName) this.firstName = updateDto.firstName;
    if (updateDto.lastName) this.lastName = updateDto.lastName;
    if (updateDto.role) {
      this.role = updateDto.role;
      // Updating rights when changing roles
      this.permissions = AdminDomainEntity.getDefaultPermissions(updateDto.role, this.permissions);
    }
    if (updateDto.status) this.status = updateDto.status;
    if (updateDto.department !== undefined) this.department = updateDto.department;
    if (updateDto.permissions) {
      this.permissions = { ...this.permissions, ...updateDto.permissions };
    }
    if (updateDto.lastActiveAt) this.lastActiveAt = updateDto.lastActiveAt;

    this.updatedAt = new Date();
  }

  // Role management
  isSuperAdmin(): boolean {
    return this.role === ADMIN_ROLES.SUPER_ADMIN;
  }

  isAdmin(): boolean {
    return this.role === ADMIN_ROLES.ADMIN;
  }

  isModerator(): boolean {
    return this.role === ADMIN_ROLES.MODERATOR;
  }

  isSupport(): boolean {
    return this.role === ADMIN_ROLES.SUPPORT;
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

  // Permission methods
  can(permission: keyof AdminPermissions): boolean {
    return this.permissions[permission] || this.isSuperAdmin();
  }

  updatePermissions(permissions: Partial<AdminPermissions>): void {
    this.permissions = { ...this.permissions, ...permissions };
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

  // Management permission methods
  canManageUsers(): boolean {
    return this.can('canManageUsers');
  }

  canManageProducts(): boolean {
    return this.can('canManageProducts');
  }

  canManageOrders(): boolean {
    return this.can('canManageOrders');
  }

  canManageContent(): boolean {
    return this.can('canManageContent');
  }

  canViewAnalytics(): boolean {
    return this.can('canViewAnalytics');
  }

  canManageSystem(): boolean {
    return this.can('canManageSystem');
  }

  canManageAdmins(): boolean {
    return this.isSuperAdmin() || this.isAdmin();
  }
}