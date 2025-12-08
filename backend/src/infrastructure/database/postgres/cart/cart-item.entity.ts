import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CartOrmEntity } from './cart.entity';

@Entity('cart_items')
export class CartItemOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cartId: string;

  @Column()
  productId: string;

  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => CartOrmEntity, cart => cart.items, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'cartId' })
  cart: CartOrmEntity;
}