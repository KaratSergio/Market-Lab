import {
  Entity, Column, Index, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { type EntityRole } from '@shared/types';


@Entity('addresses')
@Index(['entityId', 'entityType'])
@Index(['entityId', 'entityType', 'isPrimary'])
export class AddressOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityId: string;

  @Column()
  entityType: EntityRole;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  street: string;

  @Column()
  building: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  state: string;

  @Column({ type: 'float', nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  lng: number;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}