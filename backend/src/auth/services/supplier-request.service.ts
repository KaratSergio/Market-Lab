import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// DTOs and entities
import { RegSupplierProfileDto } from '../types';
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { SupplierProfileOrmEntity } from '@infrastructure/database/postgres/suppliers/supplier.entity';


@Injectable()
export class SupplierRequestService {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,

    @InjectRepository(SupplierProfileOrmEntity)
    private readonly supplierRepo: Repository<SupplierProfileOrmEntity>,
  ) { }

  /**
   * Request supplier role and create supplier profile
   */
  async requestSupplier(userId: string, dto: RegSupplierProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check if user is already a supplier
    if (user.roles.includes('supplier')) {
      throw new BadRequestException('User is already a supplier');
    }

    // Add supplier role to user
    user.roles = [...user.roles, 'supplier'];
    await this.userRepo.save(user);

    // Create supplier profile
    const supplierProfile = this.supplierRepo.create({
      user_id: user.id,
      companyName: dto.companyName,
      registrationNumber: dto.registrationNumber,
      address: dto.address,
      email: user.email,
      phone: dto.phone || '',
      documents: dto.documents ?? [],
    });

    await this.supplierRepo.save(supplierProfile);

    return this._generateUserResponse(user);
  }

  /**
   * Generate standardized user response
   * @private Internal response formatter
   */
  private _generateUserResponse(user: UserOrmEntity) {
    const { password, ...safeUser } = user;
    return { user: safeUser };
  }
}