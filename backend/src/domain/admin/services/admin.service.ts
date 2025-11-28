import { Injectable, Inject } from '@nestjs/common';
import { AdminDomainEntity } from '@domain/admin/admin.entity';
import { AdminRepository } from '@domain/admin/admin.repository';
import { CreateAdminDto, UpdateAdminDto, AdminRole, ADMIN_STATUS } from '../types';

@Injectable()
export class AdminService {
  constructor(
    @Inject('AdminRepository') private readonly adminRepository: AdminRepository
  ) { }

  async createAdmin(createDto: CreateAdminDto): Promise<AdminDomainEntity> {
    const existingAdmin = await this.adminRepository.findByUserId(createDto.userId);
    if (existingAdmin) throw new Error('User is already an admin');

    const admin = AdminDomainEntity.create(createDto);
    return this.adminRepository.create(admin);
  }

  async findAdminById(id: string): Promise<AdminDomainEntity> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) throw new Error('Admin not found');
    return admin;
  }

  async findAdminByUserId(userId: string): Promise<AdminDomainEntity | null> {
    return this.adminRepository.findByUserId(userId);
  }

  async updateAdmin(id: string, updateDto: UpdateAdminDto): Promise<AdminDomainEntity> {
    const admin = await this.findAdminById(id);
    admin.update(updateDto);

    const updated = await this.adminRepository.update(id, admin);
    if (!updated) throw new Error('Failed to update admin');
    return updated;
  }

  async deleteAdmin(id: string): Promise<void> {
    await this.adminRepository.delete(id);
  }

  async getAllAdmins(): Promise<AdminDomainEntity[]> {
    return this.adminRepository.findAll();
  }

  async getAdminsByRole(role: AdminRole): Promise<AdminDomainEntity[]> {
    return this.adminRepository.findByRole(role);
  }

  async getActiveAdmins(): Promise<AdminDomainEntity[]> {
    return this.adminRepository.findActiveAdmins();
  }

  async promoteAdmin(id: string, newRole: AdminRole): Promise<AdminDomainEntity> {
    return this.updateAdmin(id, { role: newRole });
  }

  async updateAdminPermissions(
    id: string,
    permissions: Partial<AdminDomainEntity['permissions']>
  ): Promise<AdminDomainEntity> {
    const admin = await this.findAdminById(id);
    admin.updatePermissions(permissions);

    const updated = await this.adminRepository.update(id, admin);
    if (!updated) throw new Error('Failed to update admin permissions');
    return updated;
  }

  async recordAdminActivity(userId: string): Promise<void> {
    const admin = await this.findAdminByUserId(userId);
    if (admin) {
      admin.recordActivity();
      await this.adminRepository.update(admin.id, admin);
    }
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const admin = await this.findAdminByUserId(userId);
    return admin !== null && admin.status === ADMIN_STATUS.ACTIVE;
  }

  async canUserPerformAction(
    userId: string,
    permission: keyof AdminDomainEntity['permissions']
  ): Promise<boolean> {
    const admin = await this.findAdminByUserId(userId);
    if (!admin || admin.status !== ADMIN_STATUS.ACTIVE) return false;
    return admin.can(permission);
  }
}