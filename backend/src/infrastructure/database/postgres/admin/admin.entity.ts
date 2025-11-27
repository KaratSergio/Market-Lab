import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserOrmEntity } from '../users/user.entity';
import { ADMIN_ROLES, ADMIN_STATUS } from '@domain/admin/types';
import type { AdminRole, AdminStatus } from '@domain/admin/types';


@Entity('admins')
export class AdminOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: ADMIN_ROLES,
    default: ADMIN_ROLES.ADMIN
  })
  role: AdminRole;

  @Column({
    type: 'enum',
    enum: ADMIN_STATUS,
    default: ADMIN_STATUS.ACTIVE
  })
  status: AdminStatus;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'jsonb', default: {} })
  permissions: {
    canManageUsers: boolean;
    canManageProducts: boolean;
    canManageOrders: boolean;
    canManageContent: boolean;
    canViewAnalytics: boolean;
    canManageSystem: boolean;
  };

  @Column({ nullable: true })
  lastActiveAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'userId' })
  user: UserOrmEntity;
}