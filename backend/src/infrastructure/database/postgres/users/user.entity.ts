import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { CustomerProfileOrmEntity } from '../customers/customer.entity';
import { SupplierProfileOrmEntity } from '../suppliers/supplier.entity';


@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, type: 'varchar' })
  password: string | null;

  @Column('simple-array')
  roles: string[];

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  regComplete: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Google OAuth
  @Column({ nullable: true, unique: true, type: 'varchar' })
  googleId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  googleAccessToken: string | null;

  @Column({ nullable: true, type: 'varchar' })
  googleRefreshToken: string | null;

  // relation with profiles
  @OneToOne(() => CustomerProfileOrmEntity, customer => customer.user)
  customerProfile: CustomerProfileOrmEntity;

  @OneToOne(() => SupplierProfileOrmEntity, supplier => supplier.user)
  supplierProfile: SupplierProfileOrmEntity;
}