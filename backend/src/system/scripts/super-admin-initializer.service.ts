import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '@auth/auth.service';

import { USER_ROLES } from '@domain/users/types';
import { ADMIN_ROLES } from '@domain/admin/types';

import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { AdminOrmEntity } from '@infrastructure/database/postgres/admin/admin.entity';

@Injectable()
export class SuperAdminInitializerService {
  private readonly logger = new Logger(SuperAdminInitializerService.name);
  private readonly SUPER_ADMIN_EMAIL = 'superadmin@system.com';
  private readonly TEMP_PASSWORD = 'SuperAdmin123!'; // Must be changed on first login

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(AdminOrmEntity)
    private readonly adminRepository: Repository<AdminOrmEntity>,
    private readonly authService: AuthService,
  ) { }

  async initializeSuperAdmin(): Promise<void> {
    try {
      this.logger.log('Checking if super admin exists...');

      // Check for the existence of a super-admin
      const existingSuperAdmin = await this.checkIfSuperAdminExists();

      if (existingSuperAdmin) {
        this.logger.log('Super admin already exists, skipping initialization');
        return;
      }

      this.logger.log('Creating first super admin...');

      // Create super admin user using AuthService
      const { user } = await this.authService.register({
        email: this.SUPER_ADMIN_EMAIL,
        password: this.TEMP_PASSWORD,
        role: USER_ROLES.ADMIN,
        profile: {
          firstName: 'System',
          lastName: 'Super Admin',
          phone: '+0000000000',
        },
      });

      // Create admin record
      await this.createSuperAdminRecord(user.id);

      this.logger.log('First super admin created successfully');
      this.logger.log(`Email: ${this.SUPER_ADMIN_EMAIL}`);
      this.logger.log(`Temporary password: ${this.TEMP_PASSWORD}`);
      this.logger.warn('PLEASE CHANGE THE PASSWORD ON FIRST LOGIN!');

    } catch (error) {
      this.logger.error('Failed to initialize super admin:', error);
    }
  }

  private async checkIfSuperAdminExists(): Promise<boolean> {
    try {
      // Looking for a user with the ADMIN role and the super-admin's email
      const superAdminUser = await this.userRepository.findOne({
        where: {
          email: this.SUPER_ADMIN_EMAIL,
          roles: USER_ROLES.ADMIN,
        },
      });

      if (!superAdminUser) return false;

      // Check if there is a record in the admin table with the SUPER_ADMIN role
      const adminRecord = await this.adminRepository.findOne({
        where: {
          userId: superAdminUser.id,
          role: ADMIN_ROLES.SUPER_ADMIN,
        },
      });

      return !!adminRecord;
    } catch (error) {
      this.logger.error('Error checking super admin existence:', error);
      return false;
    }
  }

  private async createSuperAdminRecord(userId: string): Promise<AdminOrmEntity> {
    const admin = this.adminRepository.create({
      userId,
      firstName: 'System',
      lastName: 'Super Admin',
      role: ADMIN_ROLES.SUPER_ADMIN,
      department: 'System Administration',
      permissions: {
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageContent: true,
        canViewAnalytics: true,
        canManageSystem: true,
      },
    });

    return await this.adminRepository.save(admin);
  }

  // Method for checking super-admin status
  async getSuperAdminStatus(): Promise<{
    exists: boolean;
    email?: string;
    role?: string;
    status?: string;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: this.SUPER_ADMIN_EMAIL }
      });

      if (!user) return { exists: false };

      const admin = await this.adminRepository.findOne({
        where: { userId: user.id }
      });

      return {
        exists: !!admin,
        email: user.email,
        role: admin?.role,
        status: admin?.status,
      };
    } catch (error) {
      this.logger.error('Error getting super admin status:', error);
      return { exists: false };
    }
  }
}