import {
  Entity, Column,
  PrimaryGeneratedColumn,
  OneToOne, JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { UserOrmEntity } from '../users/user.entity';
import type { Address } from '@shared/types';

@Entity('suppliers')
export class SupplierProfileOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserOrmEntity, user => user.supplierProfile)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column()
  user_id: string;

  @Column()
  companyName: string;

  @Column({ unique: true })
  registrationNumber: string;

  @Column({ type: 'jsonb' })
  address: Address;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('simple-array')
  documents: string[];

  @Column({
    type: 'varchar',
    default: 'pending'
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}