import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderOrmEntity } from './order.entity';

@Entity('order_items')
export class OrderItemOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column()
  productId: string;

  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => OrderOrmEntity, order => order.items, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'orderId' })
  order: OrderOrmEntity;
}