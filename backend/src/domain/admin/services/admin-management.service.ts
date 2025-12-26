import {
  Injectable,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';

// Import new services instead of old AuthService
import { RegistrationService } from '@auth/services/registration.service';
import { UserService } from '@auth/services/user.service';
import { AdminService } from '@domain/admin/services/admin.service';
import { PermissionsService } from '@auth/services/permissions.service';

// DTOs and types
import { CreateAdminDto, AdminResponse, AdminStatus, GetAdminsListOptions } from '../types';
import { Permission, Role } from '@shared/types';


@Injectable()
export class AdminManagementService {
  constructor(
    // Use new services instead of old AuthService
    private readonly registrationService: RegistrationService,
    private readonly userService: UserService,
    private readonly adminService: AdminService,
    private readonly permissionsService: PermissionsService,
  ) { }

  async createAdmin(createdByUserId: string, createDto: CreateAdminDto): Promise<AdminResponse> {
    const creatorPermissions = await this._getUserPermissions(createdByUserId);
    if (!this.permissionsService.hasAllPermissions(creatorPermissions, [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_USERS_MANAGE
    ])) {
      throw new ForbiddenException('Insufficient permissions to create admins');
    }

    if (!createDto.email || !createDto.password) {
      throw new BadRequestException('Email and password are required for new admin');
    }

    // Check if user already exists using UserService
    const existingUser = await this.userService.findByEmail(createDto.email);
    if (existingUser) {
      const existingAdmin = await this.adminService.findAdminByUserId(existingUser.id);
      if (existingAdmin) {
        throw new ConflictException('User is already an admin');
      }
    }

    // Create a user with roles using RegistrationService
    const authResult = await this.registrationService.registerAdmin({
      email: createDto.email,
      password: createDto.password,
      role: Role.ADMIN,
      profile: {
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        phone: createDto.phone,
        address: {
          street: createDto.address?.street || 'System Street',
          city: createDto.address?.city || 'System City',
          state: createDto.address?.state || 'System State',
          zipCode: createDto.address?.zipCode || '00000',
          country: createDto.address?.country || 'System Country'
        }
      },
    });

    const user = authResult.user;

    // Update user roles if additional roles are specified
    if (createDto.roles && createDto.roles.length > 0) {
      const allRoles = ['admin', ...createDto.roles.map(r => r.toString())];
      await this.userService.updateUserRoles(user.id, allRoles);
    }

    // Create an administrator
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
        status: user.status || 'active',
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
    const requesterPermissions = await this._getUserPermissions(requestedByUserId);
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

    // Get user info for each admin
    const enrichedAdmins = await Promise.all(
      paginatedAdmins.map(async admin => {
        const user = await this.userService.findById(admin.userId);
        return {
          ...admin,
          email: user?.email || 'N/A',
          userStatus: user?.status || 'active',
          primaryRole: this._getPrimaryRole(admin.roles),
        };
      })
    );

    return {
      admins: enrichedAdmins,
      pagination: {
        page: options.page,
        limit: options.limit,
        total: filteredAdmins.length,
        totalPages: Math.ceil(filteredAdmins.length / options.limit),
      }
    };
  }

  async getAdminDetails(requestedByUserId: string, targetAdminId: string) {
    const requesterPermissions = await this._getUserPermissions(requestedByUserId);
    if (!this.permissionsService.hasAllPermissions(requesterPermissions, [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_USERS_MANAGE
    ])) {
      throw new ForbiddenException('Insufficient permissions to view admin details');
    }

    const admin = await this.adminService.findAdminById(targetAdminId);
    const user = await this.userService.findById(admin.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get permissions dynamically from PermissionsService
    const userPermissions = this.permissionsService.getPermissionsByRoles(admin.roles);

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
      permissions: userPermissions, // Dynamic permissions, not from DB
      roles: admin.roles,
    };
  }

  async updateAdminRoles(
    updatedByUserId: string,
    targetAdminId: string,
    roles: string[]
  ) {
    const updaterPermissions = await this._getUserPermissions(updatedByUserId);
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
      adminRoles.includes(role.toUpperCase())
    );

    if (!hasAdminRole) {
      throw new BadRequestException('Admin must have at least one admin role');
    }

    // Update roles in UserService
    await this.userService.updateUserRoles(targetAdmin.userId, roles);

    // Update roles in the admin account
    const rolesAsEnum = roles.map(role => role as Role);
    await this.adminService.updateAdminRoles(targetAdminId, rolesAsEnum);

    return await this.adminService.findAdminById(targetAdminId);
  }

  async deleteAdmin(deletedByUserId: string, targetAdminId: string) {
    const deleterPermissions = await this._getUserPermissions(deletedByUserId);
    if (!this.permissionsService.hasAllPermissions(deleterPermissions, [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_USERS_MANAGE
    ])) {
      throw new ForbiddenException('Insufficient permissions to delete admins');
    }

    const targetAdmin = await this.adminService.findAdminById(targetAdminId);

    // Cannot delete yourself
    if (targetAdmin.userId === deletedByUserId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    // Cannot delete a super admin
    if (this._isSuperAdmin(targetAdmin.roles)) {
      throw new ForbiddenException('Cannot delete super admin');
    }

    // Delete the admin
    await this.adminService.deleteAdmin(targetAdminId);

    // Deactivate the user
    await this.userService.deactivateUser(targetAdmin.userId);

    return {
      success: true,
      message: 'Admin deleted successfully'
    };
  }

  async getUsersList(
    requestedByUserId: string,
    options: GetAdminsListOptions = { page: 1, limit: 10 }
  ) {
    const requesterPermissions = await this._getUserPermissions(requestedByUserId);
    if (!this.permissionsService.hasPermission(requesterPermissions, Permission.USER_MANAGE)) {
      throw new ForbiddenException('Insufficient permissions to view users');
    }

    // Get paginated users from UserService
    const { users, total } = await this.userService.getAllUsers(
      options.page,
      options.limit,
      options.role
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
    const updaterPermissions = await this._getUserPermissions(updatedByUserId);
    if (!this.permissionsService.hasPermission(updaterPermissions, Permission.USER_MANAGE)) {
      throw new ForbiddenException('Insufficient permissions to update user roles');
    }

    // Update roles using UserService
    await this.userService.updateUserRoles(userId, roles);

    return {
      success: true,
      message: 'User roles updated successfully'
    };
  }

  async updateAdminStatus(
    updatedByUserId: string,
    targetAdminId: string,
    status: string
  ) {
    const updaterPermissions = await this._getUserPermissions(updatedByUserId);
    if (!this.permissionsService.hasAllPermissions(updaterPermissions, [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_USERS_MANAGE
    ])) {
      throw new ForbiddenException('Insufficient permissions to update admin status');
    }

    const targetAdmin = await this.adminService.findAdminById(targetAdminId);

    // You can't change the super-admin status
    if (this._isSuperAdmin(targetAdmin.roles)) {
      throw new ForbiddenException('Cannot modify super admin status');
    }

    // Check the validity of the status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
    }

    const adminStatus = status as AdminStatus;

    return await this.adminService.updateAdmin(targetAdminId, {
      status: adminStatus
    });
  }

  /**
   * Get user permissions
   * @private Internal method for permission checking
   */
  private async _getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.userService.findById(userId);
    if (!user) return [];

    // Convert string[] to Role[]
    const roles = user.roles.map(role => role as Role);
    return this.permissionsService.getPermissionsByRoles(roles);
  }

  /**
   * Get primary role from roles array
   * @private Helper method for role hierarchy
   */
  private _getPrimaryRole(roles: Role[]): Role {
    const roleHierarchy = [
      Role.SUPER_ADMIN,
      Role.ADMIN,
      Role.MODERATOR,
      Role.SUPPORT,
      Role.SUPPLIER,
      Role.CUSTOMER,
      Role.GUEST
    ];

    for (const role of roleHierarchy) {
      if (roles.includes(role)) {
        return role;
      }
    }

    return roles[0] || Role.CUSTOMER;
  }

  /**
   * Check if user is super admin
   * @private Helper method
   */
  private _isSuperAdmin(roles: Role[]): boolean {
    return roles.includes(Role.SUPER_ADMIN);
  }
}