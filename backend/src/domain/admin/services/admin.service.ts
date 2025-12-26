import { Injectable, Inject } from '@nestjs/common';
import { AdminDomainEntity } from '@domain/admin/admin.entity';
import { AdminRepository } from '@domain/admin/admin.repository';
import { PermissionsService } from '@auth/services/permissions.service';
import { CreateAdminDto, UpdateAdminDto, ADMIN_STATUS } from '../types';
import { Permission, Role } from '@shared/types';


@Injectable()
export class AdminService {
  constructor(
    @Inject('AdminRepository')
    private readonly adminRepository: AdminRepository,
    private readonly permissionsService: PermissionsService
  ) { }

  async createAdmin(createDto: CreateAdminDto): Promise<AdminDomainEntity> {
    const existingAdmin = await this.adminRepository.findByUserId(createDto.userId);
    if (existingAdmin) throw new Error('User is already an admin');

    const admin = AdminDomainEntity.create(createDto);
    return this.adminRepository.create(admin);
  }

  async findAdminById(id: string): Promise<AdminDomainEntity> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) throw new Error('Admin not found');
    return admin;
  }

  async findAdminByUserId(userId: string): Promise<AdminDomainEntity | null> {
    return this.adminRepository.findByUserId(userId);
  }

  async updateAdmin(id: string, updateDto: UpdateAdminDto): Promise<AdminDomainEntity> {
    const admin = await this.findAdminById(id);
    admin.update(updateDto);

    const updated = await this.adminRepository.update(id, admin);
    if (!updated) throw new Error('Failed to update admin');
    return updated;
  }

  async deleteAdmin(id: string): Promise<void> {
    await this.adminRepository.delete(id);
  }

  async getAllAdmins(): Promise<AdminDomainEntity[]> {
    return this.adminRepository.findAll();
  }

  async getAdminsByRole(role: Role): Promise<AdminDomainEntity[]> {
    const allAdmins = await this.getAllAdmins();
    return allAdmins.filter(admin => admin.hasRole(role));
  }

  async getActiveAdmins(): Promise<AdminDomainEntity[]> {
    const allAdmins = await this.getAllAdmins();
    return allAdmins.filter(admin => admin.status === ADMIN_STATUS.ACTIVE);
  }

  async updateAdminRoles(id: string, roles: Role[]): Promise<AdminDomainEntity> {
    return this.updateAdmin(id, { roles });
  }

  async addRoleToAdmin(id: string, role: Role): Promise<AdminDomainEntity> {
    const admin = await this.findAdminById(id);

    if (!admin.hasRole(role)) {
      admin.addRole(role);
      const updated = await this.adminRepository.update(id, admin);
      if (!updated) throw new Error('Failed to add role to admin');
      return updated;
    }

    return admin;
  }

  async removeRoleFromAdmin(id: string, role: Role): Promise<AdminDomainEntity> {
    const admin = await this.findAdminById(id);

    if (admin.hasRole(role)) {
      admin.removeRole(role);
      const updated = await this.adminRepository.update(id, admin);
      if (!updated) throw new Error('Failed to remove role from admin');
      return updated;
    }

    return admin;
  }

  async updateAdminPermissions(
    id: string,
    permissions: Permission[]
  ): Promise<AdminDomainEntity> {
    const admin = await this.findAdminById(id);
    // Find roles that cover the requested permissions
    const newRoles = this._findRolesForPermissions(permissions);

    admin.update({ roles: newRoles });

    const updated = await this.adminRepository.update(id, admin);
    if (!updated) throw new Error('Failed to update admin permissions');
    return updated;
  }

  async recordAdminActivity(userId: string): Promise<void> {
    const admin = await this.findAdminByUserId(userId);
    if (admin) {
      admin.recordActivity();
      await this.adminRepository.update(admin.id, admin);
    }
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const admin = await this.findAdminByUserId(userId);
    return admin !== null && admin.status === ADMIN_STATUS.ACTIVE;
  }

  async canUserPerformAction(
    userId: string,
    requiredPermission: Permission
  ): Promise<boolean> {
    const admin = await this.findAdminByUserId(userId);
    if (!admin || admin.status !== ADMIN_STATUS.ACTIVE) return false;
    // Get permissions for admin roles
    const permissions = this.permissionsService.getPermissionsByRoles(admin.roles);
    // Check if the required permission exists
    return this.permissionsService.hasPermission(permissions, requiredPermission);
  }

  async getAdminWithPermissions(userId: string): Promise<{
    admin: AdminDomainEntity | null;
    permissions: Permission[];
  }> {
    const admin = await this.findAdminByUserId(userId);
    if (!admin || admin.status !== ADMIN_STATUS.ACTIVE) {
      return { admin: null, permissions: [] };
    }

    const permissions = this.permissionsService.getPermissionsByRoles(admin.roles);
    return { admin, permissions };
  }

  async validateAdminAccess(
    adminId: string,
    requiredPermissions: Permission[]
  ): Promise<{ hasAccess: boolean; missingPermissions: Permission[] }> {
    const { admin, permissions } = await this.getAdminWithPermissions(adminId);
    if (!admin) return { hasAccess: false, missingPermissions: requiredPermissions };

    const missingPermissions = requiredPermissions.filter(
      perm => !this.permissionsService.hasPermission(permissions, perm)
    );

    return {
      hasAccess: missingPermissions.length === 0,
      missingPermissions
    };
  }

  private _findRolesForPermissions(permissions: Permission[]): Role[] {
    const allRoles = Object.values(Role);
    const result: Role[] = [];

    // Search for roles that cover all requested permissions
    allRoles.forEach(role => {
      const rolePermissions = this.permissionsService.getPermissionsForRole(role);
      const hasAllPermissions = permissions.every(perm => rolePermissions.includes(perm));
      if (hasAllPermissions) result.push(role);
    });

    // If you haven't found a suitable role, add the ADMIN role
    if (result.length === 0) result.push(Role.ADMIN);

    return result;
  }

  // Convenient methods for checking specific rights
  async canManageUsers(userId: string): Promise<boolean> {
    return this.canUserPerformAction(userId, Permission.ADMIN_USERS_MANAGE);
  }

  // async canManageProducts(userId: string): Promise<boolean> {
  //   return this.canUserPerformAction(userId, Permission.PRODUCT_MANAGE);
  // }

  async canViewAnalytics(userId: string): Promise<boolean> {
    return this.canUserPerformAction(userId, Permission.ADMIN_ANALYTICS_VIEW);
  }
}