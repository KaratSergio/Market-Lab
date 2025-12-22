import {
  Injectable,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';

import { AuthService } from '@auth/auth.service';
import { AdminService } from '@domain/admin/services/admin.service';
import { PermissionsService } from '@auth/permissions/permissions.service';
import { CreateAdminDto, AdminResponse, AdminStatus } from '../types';
import { Permission, Role } from '@shared/types';


interface GetAdminsListOptions {
  page: number;
  limit: number;
  role?: string;
}

@Injectable()
export class AdminManagementService {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
    private readonly permissionsService: PermissionsService,
  ) { }

  async createAdmin(createdByUserId: string, createDto: CreateAdminDto): Promise<AdminResponse> {
    const creatorPermissions = await this.getUserPermissions(createdByUserId);
    if (!this.permissionsService.hasAllPermissions(creatorPermissions, [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_USERS_MANAGE
    ])) {
      throw new ForbiddenException('Insufficient permissions to create admins');
    }

    if (!createDto.email || !createDto.password) {
      throw new BadRequestException('Email and password are required for new admin');
    }

    const existingUser = await this.authService.findByEmail(createDto.email);
    if (existingUser) {
      const existingAdmin = await this.adminService.findAdminByUserId(existingUser.id);
      if (existingAdmin) {
        throw new ConflictException('User is already an admin');
      }
    }

    // Create a user with roles
    const authResult = await this.authService.register({
      email: createDto.email,
      password: createDto.password,
      role: Role.ADMIN,
      profile: {
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        phone: createDto.phone,
        address: {
          street: 'System Street',
          city: 'System City',
          state: 'System State',
          zipCode: '00000',
          country: 'System Country'
        }
      },
    });

    const user = authResult.user;

    // Update user roles if additional roles are specified
    if (createDto.roles && createDto.roles.length > 0) {
      const allRoles = ['admin', ...createDto.roles.map(r => r.toString())];
      await this.authService.updateUserRoles(user.id, allRoles);
    }

    // Create an administrator record
    const admin = await this.adminService.createAdmin({
      userId: user.id,
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      phone: createDto.phone,
      roles: createDto.roles || [Role.ADMIN],
      department: createDto.department,
    });

    return {
      admin,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async getAdminsList(
    requestedByUserId: string,
    options: GetAdminsListOptions = { page: 1, limit: 10 }
  ) {
    const requesterPermissions = await this.getUserPermissions(requestedByUserId);
    if (!this.permissionsService.hasAllPermissions(requesterPermissions, [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_USERS_MANAGE
    ])) {
      throw new ForbiddenException('Insufficient permissions to view admins');
    }

    const admins = await this.adminService.getAllAdmins();

    // Filter by role
    let filteredAdmins = admins;
    if (options.role) {
      filteredAdmins = admins.filter(admin =>
        admin.roles.includes(options.role as Role)
      );
    }

    // Pagination
    const start = (options.page - 1) * options.limit;
    const end = start + options.limit;
    const paginatedAdmins = filteredAdmins.slice(start, end);

    return {
      admins: paginatedAdmins.map(admin => ({
        ...admin,
        primaryRole: admin.getPrimaryRole(),
      })),
      pagination: {
        page: options.page,
        limit: options.limit,
        total: filteredAdmins.length,
        totalPages: Math.ceil(filteredAdmins.length / options.limit),
      }
    };
  }

  async getAdminDetails(requestedByUserId: string, targetAdminId: string) {
    const requesterPermissions = await this.getUserPermissions(requestedByUserId);
    if (!this.permissionsService.hasAllPermissions(requesterPermissions, [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_USERS_MANAGE
    ])) {
      throw new ForbiddenException('Insufficient permissions to view admin details');
    }

    const admin = await this.adminService.findAdminById(targetAdminId);
    const user = await this.authService.findById(admin.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userPermissions = this.permissionsService.getPermissionsByRoles(admin.roles);

    return {
      admin,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        status: user.status,
      },
      permissions: userPermissions,
      roles: admin.roles,
    };
  }

  async updateAdminRoles(
    updatedByUserId: string,
    targetAdminId: string,
    roles: string[]
  ) {
    const updaterPermissions = await this.getUserPermissions(updatedByUserId);
    if (!this.permissionsService.hasAllPermissions(updaterPermissions, [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_ROLES_MANAGE
    ])) {
      throw new ForbiddenException('Insufficient permissions to update roles');
    }

    const targetAdmin = await this.adminService.findAdminById(targetAdminId);

    // Check that at least one role is admin
    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'];
    const hasAdminRole = roles.some(role =>
      adminRoles.includes(role)
    );

    if (!hasAdminRole) throw new BadRequestException('Admin must have at least one admin role');
    // Update roles via AuthService (they are already string[])
    await this.authService.updateUserRoles(targetAdmin.userId, roles);
    // Update roles in the admin account
    const rolesAsEnum = roles.map(role => role as Role);
    await this.adminService.updateAdminRoles(targetAdminId, rolesAsEnum);

    return await this.adminService.findAdminById(targetAdminId);
  }

  async deleteAdmin(deletedByUserId: string, targetAdminId: string) {
    const deleterPermissions = await this.getUserPermissions(deletedByUserId);
    if (!this.permissionsService.hasAllPermissions(deleterPermissions, [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_USERS_MANAGE
    ])) {
      throw new ForbiddenException('Insufficient permissions to delete admins');
    }

    const targetAdmin = await this.adminService.findAdminById(targetAdminId);

    // Cannot delete yourself
    if (targetAdmin.userId === deletedByUserId) throw new ForbiddenException('Cannot delete your own account');
    // Cannot delete a super admin
    if (targetAdmin.isSuperAdmin()) throw new ForbiddenException('Cannot delete super admin');
    // Delete the admin
    await this.adminService.deleteAdmin(targetAdminId);
    // Deactivate the user
    await this.authService.deactivateUser(targetAdmin.userId);

    return { success: true, message: 'Admin deleted successfully' };
  }

  async getUsersList(
    requestedByUserId: string,
    options: GetAdminsListOptions = { page: 1, limit: 10 }
  ) {
    const requesterPermissions = await this.getUserPermissions(requestedByUserId);
    if (!this.permissionsService.hasPermission(requesterPermissions, Permission.USER_MANAGE)) {
      throw new ForbiddenException('Insufficient permissions to view users');
    }

    const { users, total } = await this.authService.getAllUsers(
      options.page,
      options.limit,
      options.role?.toString()
    );

    // Enriching the data with information about admins
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const admin = await this.adminService.findAdminByUserId(user.id);
        return {
          ...user,
          isAdmin: !!admin,
          adminInfo: admin ? {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            department: admin.department,
            status: admin.status,
          } : null,
        };
      })
    );

    return {
      users: enrichedUsers,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      }
    };
  }

  async updateUserRoles(
    updatedByUserId: string,
    userId: string,
    roles: string[]
  ) {
    const updaterPermissions = await this.getUserPermissions(updatedByUserId);
    if (!this.permissionsService.hasPermission(updaterPermissions, Permission.USER_MANAGE)) {
      throw new ForbiddenException('Insufficient permissions to update user roles');
    }
    // Convert Role[] to string[]
    const rolesAsStrings = roles.map(role => role.toString());

    await this.authService.updateUserRoles(userId, rolesAsStrings);
    return { success: true, message: 'User roles updated successfully' };
  }

  private async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.authService.findById(userId);
    if (!user) return [];
    // Convert string[] to Role[]
    const roles = user.roles.map(role => role as Role);
    return this.permissionsService.getPermissionsByRoles(roles);
  }

  async updateAdminStatus(
    updatedByUserId: string,
    targetAdminId: string,
    status: string
  ) {
    const updaterPermissions = await this.getUserPermissions(updatedByUserId);
    if (!this.permissionsService.hasAllPermissions(updaterPermissions, [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_USERS_MANAGE
    ])) {
      throw new ForbiddenException('Insufficient permissions to update admin status');
    }

    const targetAdmin = await this.adminService.findAdminById(targetAdminId);
    // You can't change the super-admin status
    if (targetAdmin.isSuperAdmin()) throw new ForbiddenException('Cannot modify super admin status');
    // Check the validity of the status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
    }

    const adminStatus = status as AdminStatus;

    return await this.adminService.updateAdmin(targetAdminId, { status: adminStatus });
  }
}