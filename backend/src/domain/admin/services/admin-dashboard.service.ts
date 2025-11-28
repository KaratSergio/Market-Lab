import { Injectable, Inject } from '@nestjs/common';
import { AdminRepository } from '@domain/admin/admin.repository';
import { AdminDomainEntity } from '@domain/admin/admin.entity';
import { AdminRole, ADMIN_ROLES, ADMIN_STATUS, AdminDistribution, SystemStats } from '../types';

@Injectable()
export class AdminDashboardService {
  constructor(
    @Inject('AdminRepository') private readonly adminRepository: AdminRepository
  ) { }

  async getSystemStats(): Promise<SystemStats> {
    const admins = await this.adminRepository.findAll();
    const activeAdmins = admins.filter(admin => admin.status === ADMIN_STATUS.ACTIVE);
    const superAdmins = admins.filter(admin => admin.role === ADMIN_ROLES.SUPER_ADMIN);

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
      [ADMIN_ROLES.SUPER_ADMIN]: 0,
      [ADMIN_ROLES.ADMIN]: 0,
      [ADMIN_ROLES.MODERATOR]: 0,
      [ADMIN_ROLES.SUPPORT]: 0,
    };

    admins.forEach(admin => {
      if (this.isValidAdminRole(admin.role)) {
        distribution[admin.role]++;
      }
    });

    return distribution;
  }

  private isValidAdminRole(role: string): role is AdminRole {
    return Object.values(ADMIN_ROLES).includes(role as AdminRole);
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
}