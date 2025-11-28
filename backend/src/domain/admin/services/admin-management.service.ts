import { Injectable, ConflictException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from '@auth/auth.service';
import { AdminService } from '@domain/admin/services/admin.service';
import { CreateAdminDto, AdminResponse, AdminPermissions } from '../types';
import { USER_ROLES } from '@domain/users/types';


@Injectable()
export class AdminManagementService {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
  ) { }

  async createAdmin(createdByUserId: string, createDto: CreateAdminDto): Promise<AdminResponse> {
    const creatorAdmin = await this.adminService.findAdminByUserId(createdByUserId);
    if (!creatorAdmin) throw new NotFoundException('Admin not found');
    if (!creatorAdmin.canManageUsers()) {
      throw new ForbiddenException('Insufficient permissions to create admins');
    }
    if (createDto.email) {
      const existingUser = await this.authService.findByEmail(createDto.email);
      if (existingUser) {
        const existingAdmin = await this.adminService.findAdminByUserId(existingUser.id);
        if (existingAdmin) throw new ConflictException('User is already an admin');
      }
    }

    // Create a user via AuthService
    let user;
    if (createDto.email && createDto.password) {
      const authResult = await this.authService.register({
        email: createDto.email,
        password: createDto.password,
        role: USER_ROLES.ADMIN,
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
      user = authResult.user;
    } else {
      throw new BadRequestException('Email and password are required for new admin');
    }

    // Create a record in the admins table
    const admin = await this.adminService.createAdmin({
      userId: user.id,
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      phone: createDto.phone,
      role: createDto.role,
      department: createDto.department,
      permissions: createDto.permissions,
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

  async getAdminsList(requestedByUserId: string) {
    const requester = await this.adminService.findAdminByUserId(requestedByUserId);
    if (!requester) throw new NotFoundException('Admin not found');
    if (!requester.canManageUsers()) throw new ForbiddenException('Insufficient permissions to view admins');

    return this.adminService.getAllAdmins();
  }

  async updateAdminPermissions(
    updatedByUserId: string,
    adminId: string,
    permissions: Partial<AdminPermissions>
  ) {
    const updater = await this.adminService.findAdminByUserId(updatedByUserId);
    if (!updater) throw new NotFoundException('Admin not found');
    if (!updater.canManageUsers()) throw new ForbiddenException('Insufficient permissions to update admins');

    const targetAdmin = await this.adminService.findAdminById(adminId);

    if (targetAdmin.isSuperAdmin() && !updater.isSuperAdmin()) {
      throw new ForbiddenException('Cannot modify super admin permissions');
    }

    return this.adminService.updateAdminPermissions(adminId, permissions);
  }

  async deleteAdmin(deletedByUserId: string, adminId: string) {
    const removed = await this.adminService.findAdminByUserId(deletedByUserId);
    if (!removed) throw new NotFoundException('Admin not found');
    if (!removed.canManageUsers()) throw new ForbiddenException('Insufficient permissions to delete admins');
    // You can't delete yourself
    const targetAdmin = await this.adminService.findAdminById(adminId);
    if (targetAdmin.userId === deletedByUserId) throw new ForbiddenException('Cannot delete your own account');
    // Super admin cannot be deleted
    if (targetAdmin.isSuperAdmin()) throw new ForbiddenException('Cannot delete super admin');

    await this.adminService.deleteAdmin(adminId);
  }
}