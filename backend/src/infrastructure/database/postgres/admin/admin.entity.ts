import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserOrmEntity } from '../users/user.entity';
import { ADMIN_STATUS } from '@domain/admin/types';
import type { AdminStatus } from '@domain/admin/types';
import { Role } from '@shared/types';

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

  @Column()
  phone: string;

  @Column({
    type: 'simple-array',
    default: Role.ADMIN
  })
  roles: string[];

  @Column({
    type: 'enum',
    enum: ADMIN_STATUS,
    default: ADMIN_STATUS.ACTIVE
  })
  status: AdminStatus;

  @Column({ nullable: true })
  department: string;

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