import {
  Entity, Column,
  PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn,
  Index, ManyToOne, ManyToMany,
  JoinColumn, JoinTable
} from 'typeorm';

import { CategoryOrmEntity } from '../categories/category.entity';
import { SupplierProfileOrmEntity } from '../suppliers/supplier.entity';
import { TagOrmEntity } from '../tags/tag.entity';

@Entity('products')
@Index(['supplierId', 'status'])
@Index(['categoryId', 'status'])
@Index(['subcategoryId', 'status'])
@Index(['supplierId', 'name'], { unique: true })
export class ProductOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'uuid' })
  supplierId: string;

  @ManyToOne(() => SupplierProfileOrmEntity)
  @JoinColumn({ name: 'supplierId' })
  supplier: SupplierProfileOrmEntity;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => CategoryOrmEntity, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: CategoryOrmEntity;

  @Column({ type: 'uuid', nullable: true })
  subcategoryId: string | null;

  @ManyToOne(() => CategoryOrmEntity, { nullable: true })
  @JoinColumn({ name: 'subcategoryId' })
  subcategory: CategoryOrmEntity;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'archived', 'draft'],
    default: 'active'
  })
  status: string;

  @ManyToMany(() => TagOrmEntity, tag => tag.products)
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' }
  })
  tags: TagOrmEntity[];

  @Column({
    type: 'enum',
    enum: ['kg', 'g', 'l', 'ml', 'pcs'],
    default: 'pcs'
  })
  unit: string;

  @Column({
    type: 'enum',
    enum: ['UAH', 'USD', 'EUR'],
    default: 'UAH'
  })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}