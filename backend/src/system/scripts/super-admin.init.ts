import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '@auth/auth.service';
import { ADMIN_ROLES } from '@domain/admin/types';
import { Role } from '@shared/types';

import { AdminOrmEntity } from '@infrastructure/database/postgres/admin/admin.entity';
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';


@Injectable()
export class SuperAdminInitService {
  private readonly logger = new Logger(SuperAdminInitService.name);

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(AdminOrmEntity)
    private readonly adminRepository: Repository<AdminOrmEntity>,
    private readonly authService: AuthService,
  ) { }

  async initializeSuperAdmin(): Promise<void> {
    const SUPER_ADMIN_EMAIL = 'superadmin@system.com';
    const TEMP_PASSWORD = 'superadmin';

    // Check if there is already a super-admin
    const existingAdmin = await this.adminRepository.findOne({
      where: {
        user: { email: SUPER_ADMIN_EMAIL },
        role: ADMIN_ROLES.SUPER_ADMIN
      },
      relations: ['user']
    });

    if (existingAdmin) {
      this.logger.log('Super admin already exists');
      return;
    }

    try {
      // Create a user via AuthService
      const { user } = await this.authService.register({
        email: SUPER_ADMIN_EMAIL,
        password: TEMP_PASSWORD,
        role: Role.ADMIN,
        profile: {
          firstName: 'System',
          lastName: 'Super Admin',
          phone: '+0000000000',
          address: {
            street: 'System Street',
            city: 'System City',
            state: 'System State',
            zipCode: '00000',
            country: 'System Country'
          }
        },
      });

      // Create a record in the admins table
      const admin = this.adminRepository.create({
        userId: user.id,
        firstName: 'System',
        lastName: 'Super Admin',
        phone: '+0000000000',
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

      await this.adminRepository.save(admin);

      this.logger.log('✅ Super admin created successfully');
      this.logger.log(`Email: ${SUPER_ADMIN_EMAIL}`);
      this.logger.log(`Temporary password: ${TEMP_PASSWORD}`);
      this.logger.warn('⚠️  CHANGE PASSWORD ON FIRST LOGIN!');

    } catch (error) {
      this.logger.error('Failed to create super admin:', error.message);
    }
  }
}