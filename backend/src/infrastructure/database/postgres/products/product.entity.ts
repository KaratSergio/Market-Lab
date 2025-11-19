import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255})
  name: string;

  @Column({ type: 'varchar', length: 1000})
  description: string;

  @Column({type: 'varchar', length: 20})
  price: number;
}