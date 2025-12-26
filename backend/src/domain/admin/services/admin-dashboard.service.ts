import { Injectable, Inject } from '@nestjs/common';
import { AdminRepository } from '@domain/admin/admin.repository';
import { AdminDomainEntity } from '@domain/admin/admin.entity';
import { ADMIN_STATUS, SystemStats, AdminDistribution } from '../types';
import { PermissionsService } from '@auth/services/permissions.service';
import { Role } from '@shared/types';


@Injectable()
export class AdminDashboardService {
  constructor(
    @Inject('AdminRepository')
    private readonly adminRepository: AdminRepository,
    private readonly permissionsService: PermissionsService
  ) { }

  async getSystemStats(): Promise<SystemStats> {
    const admins = await this.adminRepository.findAll();
    const activeAdmins = admins.filter(admin => admin.status === ADMIN_STATUS.ACTIVE);
    const superAdmins = admins.filter(admin => admin.hasRole(Role.SUPER_ADMIN));

    return {
      totalAdmins: admins.length,
      activeAdmins: activeAdmins.length,
      superAdmins: superAdmins.length,
      adminDistribution: this.getAdminDistribution(admins),
      recentActivity: this.getRecentActivity(admins),
    };
  }

  private getAdminDistribution(admins: AdminDomainEntity[]): AdminDistribution {
    const distribution: AdminDistribution = {
      [Role.SUPER_ADMIN]: 0,
      [Role.ADMIN]: 0,
      [Role.MODERATOR]: 0,
      [Role.SUPPLIER]: 0,
      [Role.CUSTOMER]: 0,
      [Role.GUEST]: 0,
    };

    admins.forEach(admin => {
      admin.roles.forEach(role => {
        if (role in distribution) {
          distribution[role as keyof AdminDistribution]++;
        }
      });
    });

    return distribution;
  }

  private getPermissionStats(admins: AdminDomainEntity[]): Record<string, number> {
    const stats: Record<string, number> = {};

    admins.forEach(admin => {
      if (admin.userId) {
        const permissions = this.permissionsService.getPermissionsByRoles(admin.roles);
        permissions.forEach(permission => {
          stats[permission] = (stats[permission] || 0) + 1;
        });
      }
    });

    return stats;
  }

  private getRecentActivity(admins: AdminDomainEntity[]): AdminDomainEntity[] {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return admins
      .filter(admin =>
        admin.lastActiveAt &&
        new Date(admin.lastActiveAt) > oneDayAgo
      )
      .sort((a, b) =>
        new Date(b.lastActiveAt!).getTime() - new Date(a.lastActiveAt!).getTime()
      )
      .slice(0, 10);
  }

  async getAdminPerformanceMetrics(): Promise<{
    mostActive: AdminDomainEntity[];
    recentlyAdded: AdminDomainEntity[];
  }> {
    const admins = await this.adminRepository.findAll();

    const mostActive = admins
      .filter(admin => admin.lastActiveAt)
      .sort((a, b) => new Date(b.lastActiveAt!).getTime() - new Date(a.lastActiveAt!).getTime())
      .slice(0, 5);

    const recentlyAdded = admins
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return { mostActive, recentlyAdded };
  }

  async getDashboardData(adminId: string): Promise<any> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    const stats = await this.getSystemStats();
    const metrics = await this.getAdminPerformanceMetrics();
    const permissions = this.permissionsService.getPermissionsByRoles(admin.roles);

    return {
      userInfo: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        roles: admin.roles,
        primaryRole: admin.getPrimaryRole(),
        department: admin.department,
      },
      stats,
      metrics,
      permissions,
      quickActions: this.getQuickActionsForRoles(admin.roles),
    };
  }

  private getQuickActionsForRoles(roles: Role[]): string[] {
    const actions: string[] = [];

    if (roles.includes(Role.SUPER_ADMIN)) actions.push('manage_admins', 'view_reports', 'system_settings', 'manage_roles');
    if (roles.includes(Role.ADMIN)) actions.push('manage_users', 'view_analytics', 'manage_products', 'view_orders');
    if (roles.includes(Role.MODERATOR)) actions.push('review_content', 'manage_reviews', 'view_reports');
    if (roles.includes(Role.SUPPLIER)) actions.push('manage_products', 'view_orders');

    return [...new Set(actions)];
  }
}