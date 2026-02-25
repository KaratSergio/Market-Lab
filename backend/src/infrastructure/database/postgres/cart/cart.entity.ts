import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { UserOrmEntity } from '../users/user.entity';
import { CartItemOrmEntity } from './cart-item.entity';
import { CART_STATUS, CART_OWNER_TYPE } from '@domain/cart/types';
import type { CartStatus, CartOwnerType } from '@domain/cart/types';


@Entity('carts')
export class CartOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({
    type: 'enum',
    enum: CART_OWNER_TYPE,
    default: CART_OWNER_TYPE.USER
  })
  ownerType: CartOwnerType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  finalAmount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: CART_STATUS,
    default: CART_STATUS.ACTIVE
  })
  status: CartStatus;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'userId' })
  user: UserOrmEntity;

  @OneToMany(() => CartItemOrmEntity, item => item.cart, {
    cascade: true,
    eager: true
  })
  items: CartItemOrmEntity[];
}