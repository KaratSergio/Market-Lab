import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerOrmEntity } from '../customers/customer.entity';

export type SupplierStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

@Entity('suppliers')
export class SupplierOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CustomerOrmEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerOrmEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  documents?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending'
  })
  status: SupplierStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}