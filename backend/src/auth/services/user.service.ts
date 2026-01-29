import { Injectable, NotFoundException, Inject } from '@nestjs/common';

// Domain repository and entity
import type { UserRepository } from '@domain/users/user.repository';
import { UserDomainEntity } from '@domain/users/user.entity';
import { USER_STATUS, USER_ROLES, UserRole, UserStatus } from '@domain/users/types';

// auth services
import { EncryptService } from '@auth/encrypt/encrypt.service';


@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly encrypt: EncryptService,
  ) { }

  // FIND METHODS

  async findByEmail(email: string): Promise<UserDomainEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(userId: string): Promise<UserDomainEntity | null> {
    return this.userRepository.findById(userId);
  }

  async findByGoogleId(googleId: string): Promise<UserDomainEntity | null> {
    const users = await this.userRepository.findMany({ googleId: googleId });
    return users.length > 0 ? users[0] : null;
  }

  // AUTH METHODS

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user || !user.passwordHash) return null;

    const isValid = await this.encrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // UPDATE METHODS

  async updateUserRoles(userId: string, roles: string[]): Promise<UserDomainEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const userRoles: UserRole[] = roles.map(role => this._convertToUserRole(role));
    const uniqueRoles = [...new Set(userRoles)];

    const updatedUser = await this.userRepository.update(userId, {
      roles: uniqueRoles,
      updatedAt: new Date(),
    });

    if (!updatedUser) throw new NotFoundException('User not found');
    return updatedUser;
  }

  async deactivateUser(userId: string): Promise<UserDomainEntity> {
    const updatedUser = await this.userRepository.update(userId, {
      status: USER_STATUS.INACTIVE,
      updatedAt: new Date(),
    });

    if (!updatedUser) throw new NotFoundException('User not found');
    return updatedUser;
  }

  async updateUserStatus(userId: string, status: string): Promise<UserDomainEntity> {
    const userStatus = this._convertToUserStatus(status);

    const updatedUser = await this.userRepository.update(userId, {
      status: userStatus,
      updatedAt: new Date(),
    });

    if (!updatedUser) throw new NotFoundException('User not found');
    return updatedUser;
  }

  // QUERY METHODS

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: string
  ): Promise<{ users: UserDomainEntity[]; total: number }> {
    const filter = role ? { roles: [this._convertToUserRole(role)] } : {};

    const [allUsers, total] = await Promise.all([
      this.userRepository.findMany(filter),
      this._getUserCount(filter),
    ]);

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = allUsers.slice(start, end);

    return { users: paginatedUsers, total };
  }

  async getUsersByRole(role: string): Promise<UserDomainEntity[]> {
    const userRole = this._convertToUserRole(role);
    return this.userRepository.findMany({ roles: [userRole] });
  }

  async getAdmins(): Promise<UserDomainEntity[]> {
    return this.userRepository.findMany({
      roles: [USER_ROLES.ADMIN as UserRole]
    });
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;

    return user.roles.includes(USER_ROLES.ADMIN as UserRole);
  }

  // PRIVATE HELPERS

  private async _getUserCount(filter: Partial<UserDomainEntity>): Promise<number> {
    const users = await this.userRepository.findMany(filter);
    return users.length;
  }

  private _convertToUserRole(role: string): UserRole {
    const roleMap: Record<string, UserRole> = {
      'customer': USER_ROLES.CUSTOMER as UserRole,
      'supplier': USER_ROLES.SUPPLIER as UserRole,
      'admin': USER_ROLES.ADMIN as UserRole,
      'super_admin': USER_ROLES.ADMIN as UserRole,
      'admin_moderator': USER_ROLES.ADMIN as UserRole,
      'moderator': USER_ROLES.ADMIN as UserRole,
      'support': USER_ROLES.ADMIN as UserRole,
      'guest': USER_ROLES.CUSTOMER as UserRole,
    };

    return roleMap[role.toLowerCase()] || USER_ROLES.CUSTOMER as UserRole;
  }

  private _convertToUserStatus(status: string): UserStatus {
    const statusMap: Record<string, UserStatus> = {
      'active': USER_STATUS.ACTIVE,
      'inactive': USER_STATUS.INACTIVE,
      'suspended': USER_STATUS.SUSPENDED,
    };

    return statusMap[status.toLowerCase()] || USER_STATUS.ACTIVE;
  }
}