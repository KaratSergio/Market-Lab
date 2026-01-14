import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from '@domain/products/product.service';
import { SupplierOrAdmin, Auth } from '@auth/decorators';
import { ParseFormDataJson } from '@shared/decorators';
import type { AuthRequest } from '@auth/types';

import {
  Controller, Delete, Put, Post, Get,
  Param, Request, UploadedFiles, ParseUUIDPipe,
  HttpCode, HttpStatus, UseInterceptors
} from '@nestjs/common';

import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiParam, ApiBody, ApiConsumes
} from '@nestjs/swagger';

import {
  AddImagesDtoSwagger,
  RemoveImageDtoSwagger,
  UpdateProductStatusDtoSwagger,
  SuccessResponseProductDtoSwagger
} from '@domain/products/types';


@ApiTags('products')
@Controller('products')
export class ProductSharedController {
  constructor(private readonly productService: ProductService) { }

  @Delete(':id')
  @SupplierOrAdmin()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete product (Supplier or Admin)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 204, description: 'Product deleted' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.productService.delete(id, userId, userRoles);
  }

  @Post(':id/images')
  @SupplierOrAdmin()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add images to product (Supplier or Admin)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AddImagesDtoSwagger })
  @ApiResponse({
    status: 201,
    schema: {
      properties: {
        success: { type: 'boolean' },
        urls: { type: 'array', items: { type: 'string' } },
        message: { type: 'string' }
      }
    }
  })
  async addImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() images: Express.Multer.File[],
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    const uploadedUrls = await this.productService.addImages(id, userId, userRoles, images);
    return {
      success: true,
      urls: uploadedUrls,
      message: `${uploadedUrls.length} image(s) added successfully`
    };
  }

  @Delete(':id/images')
  @SupplierOrAdmin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove image from product (Supplier or Admin)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: RemoveImageDtoSwagger })
  @ApiResponse({ status: 200, type: SuccessResponseProductDtoSwagger })
  async removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @ParseFormDataJson() body: { imageUrl: string },
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    await this.productService.removeImage(id, userId, userRoles, body.imageUrl);
    return { success: true, message: 'Image removed successfully' };
  }

  @Put(':id/status')
  @SupplierOrAdmin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product status (Supplier or Admin)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductStatusDtoSwagger })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @ParseFormDataJson() dto: { status: string },
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    const validStatuses = ['active', 'inactive', 'archived', 'draft'];
    if (!validStatuses.includes(dto.status)) {
      throw new BadRequestException('Invalid status');
    }
    return this.productService.toggleStatus(id, dto.status as any, userId, userRoles);
  }

  @Get(':id/ownership')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check product ownership (Authenticated)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        isOwner: { type: 'boolean' },
        isSupplier: { type: 'boolean' },
        isAdmin: { type: 'boolean' },
        canEdit: { type: 'boolean' },
        canDelete: { type: 'boolean' }
      }
    }
  })
  async checkOwnership(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    return this.productService.checkOwnership(id, userId);
  }
}