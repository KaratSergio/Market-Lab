import {
  Controller,
  Get, UseGuards
} from '@nestjs/common';

import {
  ApiTags, ApiOperation,
  ApiResponse, ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';

import { AuthJwtGuard, PermissionsGuard } from '@auth/guard';
import { Permissions } from '@auth/decorators';
import { Permission } from '@shared/types';
import { AdminDashboardService } from '@domain/admin/services/admin-dashboard.service';

// Swagger DTOs
import {
  DashboardResponseDtoSwagger,
  AnalyticsResponseDtoSwagger,
  SettingsResponseDtoSwagger,
  PermissionsListResponseDtoSwagger,
  RolesListResponseDtoSwagger,
} from '@domain/admin/types/admin.swagger.dto';


@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(AuthJwtGuard, PermissionsGuard)
export class AdminController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService
  ) { }

  /**
   * GET ADMIN DASHBOARD
   * @description Retrieves comprehensive dashboard data including system statistics,
   * performance metrics, and quick overview stats. Requires ADMIN_DASHBOARD_VIEW permission.
   */
  @Get('dashboard')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_DASHBOARD_VIEW)
  @ApiOperation({
    summary: 'Get admin dashboard',
    description: 'Retrieves comprehensive dashboard data including system statistics, performance metrics, and quick overview stats.'
  })
  @ApiOkResponse({
    description: 'Dashboard data retrieved successfully',
    type: DashboardResponseDtoSwagger,
  })
  @ApiResponse({
    status: 403,
    description: 'User lacks ADMIN_DASHBOARD_VIEW permission',
  })
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

  /**
   * GET ADMIN ANALYTICS
   * @description Retrieves advanced analytics data including sales metrics,
   * user growth trends, product popularity, and revenue breakdown.
   * Requires ADMIN_ANALYTICS_VIEW permission.
   */
  @Get('analytics')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_ANALYTICS_VIEW)
  @ApiOperation({
    summary: 'Get admin analytics',
    description: 'Retrieves advanced analytics data including sales metrics, user growth trends, product popularity, and revenue breakdown.'
  })
  @ApiOkResponse({
    description: 'Analytics data retrieved successfully',
    type: AnalyticsResponseDtoSwagger,
  })
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

  /**
   * GET ADMIN SETTINGS
   * @description Retrieves system configuration settings including payment,
   * notification, and general system settings.
   * Requires ADMIN_SETTINGS_VIEW permission.
   */
  @Get('settings')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_SETTINGS_VIEW)
  @ApiOperation({
    summary: 'Get admin settings',
    description: 'Retrieves system configuration settings including payment, notification, and general system settings.'
  })
  @ApiOkResponse({
    description: 'Settings retrieved successfully',
    type: SettingsResponseDtoSwagger,
  })
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

  /**
   * GET PERMISSIONS LIST
   * @description Retrieves complete list of available system permissions.
   * Requires ADMIN_PERMISSIONS_MANAGE permission.
   */
  @Get('permissions/list')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_PERMISSIONS_MANAGE)
  @ApiOperation({
    summary: 'Get permissions list',
    description: 'Retrieves complete list of available system permissions.'
  })
  @ApiOkResponse({
    description: 'Permissions list retrieved successfully',
    type: PermissionsListResponseDtoSwagger,
  })
  async getPermissionsList() {
    return {
      message: 'Available permissions',
      data: {
        permissions: Object.values(Permission)
      }
    };
  }

  /**
   * GET ROLES LIST
   * @description Retrieves list of available user roles in the system.
   * Requires ADMIN_ROLES_MANAGE permission.
   */
  @Get('roles/list')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_ROLES_MANAGE)
  @ApiOperation({
    summary: 'Get roles list',
    description: 'Retrieves list of available user roles in the system.'
  })
  @ApiOkResponse({
    description: 'Roles list retrieved successfully',
    type: RolesListResponseDtoSwagger,
  })
  async getRolesList() {
    return {
      message: 'Available roles',
      data: {
        roles: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MODERATOR', 'SUPPLIER', 'CUSTOMER', 'GUEST']
      }
    };
  }
}