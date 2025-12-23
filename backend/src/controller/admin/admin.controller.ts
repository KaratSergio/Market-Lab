import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthJwtGuard, PermissionsGuard } from '@auth/guard';
import { Permissions } from '@auth/decorators';
import { Permission } from '@shared/types';
import { AdminDashboardService } from '@domain/admin/services/admin-dashboard.service';


@Controller('admin')
@UseGuards(AuthJwtGuard, PermissionsGuard)
export class AdminController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService
  ) { }

  @Get('dashboard')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_DASHBOARD_VIEW)
  async getDashboard() {
    const systemStats = await this.adminDashboardService.getSystemStats();
    const performanceMetrics = await this.adminDashboardService.getAdminPerformanceMetrics();

    return {
      message: 'Admin dashboard',
      data: {
        systemStats,
        performanceMetrics,
        quickStats: {
          totalUsers: 0,
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
        }
      }
    };
  }

  @Get('analytics')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_ANALYTICS_VIEW)
  async getAnalytics() {
    return {
      message: 'Admin analytics',
      data: {
        salesData: [],
        userGrowth: [],
        popularProducts: [],
        revenueByCategory: []
      }
    };
  }

  @Get('settings')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_SETTINGS_VIEW)
  async getSettings() {
    return {
      message: 'Admin settings',
      data: {
        systemSettings: {},
        paymentSettings: {},
        notificationSettings: {}
      }
    };
  }

  @Get('permissions/list')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_PERMISSIONS_MANAGE)
  async getPermissionsList() {
    return {
      message: 'Available permissions',
      data: {
        permissions: Object.values(Permission)
      }
    };
  }

  @Get('roles/list')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_ROLES_MANAGE)
  async getRolesList() {
    return {
      message: 'Available roles',
      data: {
        roles: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MODERATOR', 'SUPPLIER', 'CUSTOMER', 'GUEST']
      }
    };
  }
}