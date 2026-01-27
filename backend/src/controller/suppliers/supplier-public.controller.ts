import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiOkResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';
import { SupplierService } from '@domain/suppliers/services/supplier.service';
import { SupplierPublicResponseDtoSwagger } from '@domain/suppliers/types/supplier.swagger.dto';
import { type LanguageCode, SUPPORTED_LANGUAGES } from '@domain/translations/types';

@ApiTags('suppliers-public')
@Controller('suppliers')
export class SupplierPublicController {
  constructor(private readonly supplierService: SupplierService) { }

  /**
   * GET ALL ACTIVE SUPPLIERS (Public)
   */
  @Get('public/active')
  @ApiOperation({
    summary: 'Get all active suppliers (Public)',
    description: 'Retrieves list of all active and approved suppliers. Public endpoint accessible without authentication.'
  })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES),
    description: 'Language code for translations'
  })
  @ApiOkResponse({
    description: 'Active suppliers list retrieved successfully',
    type: [SupplierPublicResponseDtoSwagger],
  })
  async findAllActive(
    @Query('language') language?: LanguageCode
  ) {
    return this.supplierService.findAllActive(language);
  }

  /**
   * GET SUPPLIER PUBLIC INFO (Public)
   */
  @Get('public/:id')
  @ApiOperation({
    summary: 'Get supplier public info (Public)',
    description: 'Retrieves public information about a specific supplier. Public endpoint accessible without authentication.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES),
    description: 'Language code for translations'
  })
  @ApiOkResponse({
    description: 'Supplier public info retrieved successfully',
    type: SupplierPublicResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Supplier not found or not active',
  })
  async getPublicInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('language') language?: LanguageCode
  ) {
    return this.supplierService.getPublicSupplierInfo(id, language);
  }
}