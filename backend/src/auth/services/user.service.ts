import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';

// Infrastructure services
import { EncryptService } from '../encrypt/encrypt.service';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    private readonly encrypt: EncryptService,
  ) { }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserOrmEntity | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  /**
   * Find user by ID with relations
   */
  async findById(userId: string): Promise<UserOrmEntity | null> {
    return this.userRepo.findOne({
      where: { id: userId },
      relations: ['customerProfile', 'supplierProfile']
    });
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<UserOrmEntity | null> {
    return this.userRepo.findOne({ where: { googleId } });
  }

  /**
   * Validate user credentials (email + password)
   * @returns User object without password or null if invalid
   */
  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);

    // Check if user exists and has password (Google users may not have one)
    if (!user || !user.password) return null;

    // Verify password
    const isValid = await this.encrypt.compare(password, user.password);
    if (!isValid) return null;

    // Return user without password
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Update user roles
   */
  async updateUserRoles(userId: string, roles: string[]): Promise<UserOrmEntity> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Remove duplicates and update
    user.roles = [...new Set(roles)];
    user.updatedAt = new Date();

    return this.userRepo.save(user);
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<UserOrmEntity> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.status = 'inactive';
    user.updatedAt = new Date();

    return this.userRepo.save(user);
  }

  /**
   * Get paginated list of users with optional role filter
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: string
  ): Promise<{ users: UserOrmEntity[]; total: number }> {
    const queryBuilder = this.userRepo.createQueryBuilder('user');

    // Filter by role if provided
    if (role) {
      queryBuilder.where(':role = ANY(user.roles)', { role });
    }

    // Apply pagination
    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { users, total };
  }

  /**
   * Get users by specific role
   */
  async getUsersByRole(role: string): Promise<UserOrmEntity[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .where(':role = ANY(user.roles)', { role })
      .getMany();
  }

  /**
   * Get all admin users (admin, super_admin, admin_moderator)
   */
  async getAdmins(): Promise<UserOrmEntity[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .where(`user.roles && ARRAY['admin', 'super_admin', 'admin_moderator']::text[]`)
      .getMany();
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: string): Promise<UserOrmEntity> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.status = status;
    user.updatedAt = new Date();

    return this.userRepo.save(user);
  }

  /**
   * Check if user has admin role
   */
  async isUserAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return false;

    const adminRoles = ['admin', 'super_admin', 'admin_moderator'];
    return user.roles.some(role => adminRoles.includes(role));
  }
}