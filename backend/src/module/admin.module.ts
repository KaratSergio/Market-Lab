import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Auth
import { AuthModule } from '@auth/auth.module';

// ORM Entities
import { AdminOrmEntity } from '@infrastructure/database/postgres/admin/admin.entity';

// Repositories
import { PostgresAdminRepository } from '@infrastructure/database/postgres/admin/admin.repository';

// Controllers
import { AdminController } from '@controller/admin/admin.controller';
import { AdminManagementController } from '@controller/admin/admin-management.controller';

// Domain Services
import { AdminService } from '@domain/admin/services/admin.service';
import { AdminManagementService } from '@domain/admin/services/admin-management.service';
import { AdminDashboardService } from '@domain/admin/services/admin-dashboard.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([AdminOrmEntity]),
    AuthModule,
  ],
  controllers: [AdminController, AdminManagementController],
  providers: [
    // Main admin service
    AdminService,

    // Admin management service
    AdminManagementService,

    // Admin dashboard service
    AdminDashboardService,

    // Admin repository
    {
      provide: 'AdminRepository',
      useClass: PostgresAdminRepository,
    },
  ],
  exports: [
    AdminService,
    AdminManagementService
  ],
})
export class AdminModule { }