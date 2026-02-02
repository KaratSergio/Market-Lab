import { Injectable, Inject } from '@nestjs/common';
import { Address } from './address.entity';
import { AddressRepository } from './address.repository';
import { CreateAddressDto, UpdateAddressDto } from './types/address.dto';
import { EntityRole } from '@shared/types';


@Injectable()
export class AddressService {
  constructor(
    @Inject('AddressRepository')
    private readonly addressRepository: AddressRepository,
  ) { }

  async createAddress(createDto: CreateAddressDto): Promise<Address> {
    const address = Address.create(createDto);

    if (address.isPrimary) {
      await this._unsetOtherPrimaryAddresses(createDto.entityId, createDto.entityType);
    }

    return await this.addressRepository.create(address);
  }

  async updateAddress(id: string, updateDto: UpdateAddressDto): Promise<Address | null> {
    const address = await this.addressRepository.findById(id);
    if (!address) throw new Error('Address not found');

    address.updateDetails(updateDto);

    if (updateDto.isPrimary) {
      await this._unsetOtherPrimaryAddresses(address.entityId, address.entityType, id);
    }

    return await this.addressRepository.update(id, address);
  }

  async setPrimaryAddress(id: string): Promise<Address | null> {
    const address = await this.addressRepository.findById(id);
    if (!address) throw new Error('Address not found');

    await this._unsetOtherPrimaryAddresses(address.entityId, address.entityType, id);

    address.setAsPrimary();
    return await this.addressRepository.update(id, address);
  }

  async getEntityAddresses(entityId: string, entityType: EntityRole): Promise<Address[]> {
    return this.addressRepository.findByEntity(entityId, entityType);
  }

  async getPrimaryAddress(entityId: string, entityType: EntityRole): Promise<Address | null> {
    return this.addressRepository.findPrimaryByEntity(entityId, entityType);
  }

  async deleteAddress(id: string): Promise<void> {
    const address = await this.addressRepository.findById(id);
    if (!address) throw new Error('Address not found');

    const entityAddresses = await this.addressRepository.findByEntity(
      address.entityId,
      address.entityType
    );

    if (entityAddresses.length === 1) throw new Error('Cannot delete the only address of an entity');

    if (address.isPrimary) {
      const otherAddress = entityAddresses.find(addr => addr.id !== id);
      if (otherAddress) {
        otherAddress.setAsPrimary();
        await this.addressRepository.update(otherAddress.id, otherAddress);
      }
    }

    await this.addressRepository.delete(id);
  }

  private async _unsetOtherPrimaryAddresses(
    entityId: string,
    entityType: EntityRole,
    excludeAddressId?: string
  ): Promise<void> {
    const addresses = await this.addressRepository.findByEntity(entityId, entityType);

    const updatePromises = addresses
      .filter(addr => addr.isPrimary && (!excludeAddressId || addr.id !== excludeAddressId))
      .map(addr => {
        addr.setAsSecondary();
        return this.addressRepository.update(addr.id, addr);
      });

    await Promise.all(updatePromises);
  }
}