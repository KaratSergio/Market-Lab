import {
  Entity, Column,
  PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn,
  Index, ManyToMany, JoinTable
} from 'typeorm';
import { ProductOrmEntity } from '../products/product.entity';


@Entity('tags')
@Index(['slug'], { unique: true })
@Index(['name'], { unique: true })
@Index(['status', 'usageCount'])
export class TagOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active'
  })
  status: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @ManyToMany(() => ProductOrmEntity, product => product.tags)
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'tagId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' }
  })
  products: ProductOrmEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}