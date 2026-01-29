//@ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@shared/types';

// Import new services instead of old AuthService
import { RegistrationService } from '@auth/services/registration.service';
import { UserService } from '@auth/services/user.service';

// Entities
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

    // Use new services instead of old AuthService
    private readonly registrationService: RegistrationService,
    private readonly userService: UserService,
  ) { }

  async initializeSuperAdmin(): Promise<void> {
    const SUPER_ADMIN_EMAIL = 'superadmin@system.com';
    const TEMP_PASSWORD = 'superadmin';

    // Check if there is already a super-admin
    const existingAdmin = await this.adminRepository.findOne({
      where: {
        user: { email: SUPER_ADMIN_EMAIL },
      },
      relations: ['user']
    });

    if (existingAdmin) {
      this.logger.log('Super admin already exists');
      return;
    }

    try {
      // Step 1: Create user using RegistrationService
      const { user } = await this.registrationService.registerAdmin({
        email: SUPER_ADMIN_EMAIL,
        password: TEMP_PASSWORD,
        role: Role.ADMIN, // Initial role (will be updated)
        profile: {
          firstName: 'System',
          lastName: 'Super Admin',
          phone: '+0000000000',
          address: {
            street: 'System Street',
            city: 'System City',
            state: 'System State',
            postalCode: '00000',
            country: 'System Country',
            building: 'System Building'
          }
        },
      });

      // Step 2: Update user roles to SUPER_ADMIN using UserService
      await this.userService.updateUserRoles(user.id, [Role.SUPER_ADMIN.toString()]);

      // Step 3: Create admin record WITHOUT permissions field
      // Permissions are handled by PermissionsService based on roles
      const adminData = {
        userId: user.id,
        firstName: 'System',
        lastName: 'Super Admin',
        phone: '+0000000000',
        roles: [Role.SUPER_ADMIN],
        department: 'System Administration',
        // REMOVED: permissions: ['*'] - NOT NEEDED
      };

      // Create admin using create() method
      const admin = this.adminRepository.create(adminData);

      // Save to database
      await this.adminRepository.save(admin);

      this.logger.log('✅ Super admin created successfully');
      this.logger.log(`Email: ${SUPER_ADMIN_EMAIL}`);
      this.logger.log(`Temporary password: ${TEMP_PASSWORD}`);
      this.logger.warn('⚠️  CHANGE PASSWORD ON FIRST LOGIN!');

    } catch (error) {
      this.logger.error('Failed to create super admin:', error.message);
      // Re-throw to handle in main.ts or app initialization
      throw error;
    }
  }
}