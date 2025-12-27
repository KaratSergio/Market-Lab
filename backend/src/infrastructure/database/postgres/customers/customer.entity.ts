import {
  Entity, Column,
  PrimaryGeneratedColumn,
  OneToOne, JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

import { UserOrmEntity } from '../users/user.entity';
import { Address } from '@shared/types';

@Entity('customers')
export class CustomerProfileOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserOrmEntity, user => user.customerProfile)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column()
  user_id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date | null;

  @Column({
    type: 'varchar',
    default: 'active'
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  address: Address | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}