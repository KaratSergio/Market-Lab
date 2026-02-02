import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressOrmEntity } from './address.entity';
import { Address } from '@domain/addresses/address.entity';
import { AddressRepository as DomainAddressRepository } from '@domain/addresses/address.repository';
import { EntityRole } from '@shared/types';


@Injectable()
export class PostgresAddressRepository implements DomainAddressRepository {
  constructor(
    @InjectRepository(AddressOrmEntity)
    private readonly repository: Repository<AddressOrmEntity>,
  ) { }

  async create(data: Partial<Address>): Promise<Address> {
    const ormEntity = this.toOrmEntity(data);
    const saved = await this.repository.save(ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Address | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async update(id: string, data: Partial<Address>): Promise<Address | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findOne(filter: Partial<Address>): Promise<Address | null> {
    const entity = await this.repository.findOne({ where: filter });
    return entity ? this.toDomain(entity) : null;
  }

  async findMany(filter: Partial<Address>): Promise<Address[]> {
    const entities = await this.repository.find({ where: filter });
    return entities.map(this.toDomain);
  }

  async findAll(): Promise<Address[]> {
    const entities = await this.repository.find();
    return entities.map(this.toDomain);
  }

  async findByEntity(entityId: string, entityType: EntityRole): Promise<Address[]> {
    const entities = await this.repository.find({
      where: { entityId, entityType },
      order: { isPrimary: 'DESC', createdAt: 'ASC' }
    });
    return entities.map(this.toDomain);
  }

  async findPrimaryByEntity(entityId: string, entityType: EntityRole): Promise<Address | null> {
    const entity = await this.repository.findOne({
      where: { entityId, entityType, isPrimary: true }
    });
    return entity ? this.toDomain(entity) : null;
  }

  private toOrmEntity(domainEntity: Partial<Address>): AddressOrmEntity {
    const entity = new AddressOrmEntity();
    Object.assign(entity, domainEntity);
    return entity;
  }

  private toDomain(ormEntity: AddressOrmEntity): Address {
    return Address.restore({
      id: ormEntity.id,
      entityId: ormEntity.entityId,
      entityType: ormEntity.entityType,
      country: ormEntity.country,
      city: ormEntity.city,
      street: ormEntity.street,
      building: ormEntity.building,
      postalCode: ormEntity.postalCode,
      state: ormEntity.state,
      lat: ormEntity.lat,
      lng: ormEntity.lng,
      isPrimary: ormEntity.isPrimary,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }
}