import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDomainEntity } from './user.entity';
import { UserRole, USER_ROLES } from './types';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) { }

  // Basic CRUD operations
  async findById(id: string): Promise<UserDomainEntity | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<UserDomainEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async create(data: Partial<UserDomainEntity>): Promise<UserDomainEntity> {
    return this.userRepository.create(data);
  }

  async update(id: string, data: Partial<UserDomainEntity>): Promise<UserDomainEntity | null> {
    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  // Query methods
  async findAll(): Promise<UserDomainEntity[]> {
    return this.userRepository.findAll();
  }

  async findOne(filter: Partial<UserDomainEntity>): Promise<UserDomainEntity | null> {
    return this.userRepository.findOne(filter);
  }

  async findMany(filter: Partial<UserDomainEntity>): Promise<UserDomainEntity[]> {
    return this.userRepository.findMany(filter);
  }

  // Role-based methods
  async findByRole(role: UserRole | string): Promise<UserDomainEntity[]> {
    return this.userRepository.findByRole(role.toString());
  }

  async findCustomers(): Promise<UserDomainEntity[]> {
    return this.userRepository.findByRole(USER_ROLES.CUSTOMER);
  }

  async findSuppliers(): Promise<UserDomainEntity[]> {
    return this.userRepository.findByRole(USER_ROLES.SUPPLIER);
  }

  async findAdmins(): Promise<UserDomainEntity[]> {
    return this.userRepository.findByRole(USER_ROLES.ADMIN);
  }

  // Status methods
  async findByStatus(status: string): Promise<UserDomainEntity[]> {
    return this.userRepository.findByStatus(status);
  }

  async findActiveUsers(): Promise<UserDomainEntity[]> {
    return this.userRepository.findByStatus('active');
  }

  async findInactiveUsers(): Promise<UserDomainEntity[]> {
    return this.userRepository.findByStatus('inactive');
  }

  // Google OAuth methods
  async findByGoogleId(googleId: string): Promise<UserDomainEntity | null> {
    return this.userRepository.findByGoogleId(googleId);
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<UserDomainEntity | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;

    user.googleId = googleId;
    return this.userRepository.update(userId, { googleId });
  }

  async unlinkGoogleAccount(userId: string): Promise<UserDomainEntity | null> {
    return this.userRepository.update(userId, { googleId: undefined });
  }

  // Utility methods
  async getEmailById(id: string): Promise<string | null> {
    const user = await this.userRepository.findById(id);
    return user?.email || null;
  }

  async getUserRole(id: string): Promise<UserRole[] | null> {
    const user = await this.userRepository.findById(id);
    return user?.roles || null;
  }

  async isUserActive(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    return user?.status === 'active';
  }

  async exists(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    return !!user;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    return !!user;
  }

  // Bulk operations
  async updateMany(ids: string[], data: Partial<UserDomainEntity>): Promise<void> {
    await Promise.all(ids.map(id => this.userRepository.update(id, data)));
  }

  async deleteMany(ids: string[]): Promise<void> {
    await Promise.all(ids.map(id => this.userRepository.delete(id)));
  }

  // Domain-specific business logic
  async activateUser(id: string): Promise<UserDomainEntity | null> {
    return this.userRepository.update(id, { status: 'active' });
  }

  async deactivateUser(id: string): Promise<UserDomainEntity | null> {
    return this.userRepository.update(id, { status: 'inactive' });
  }

  async updateLastLogin(id: string): Promise<UserDomainEntity | null> {
    return this.userRepository.update(id, { lastLoginAt: new Date() });
  }
}