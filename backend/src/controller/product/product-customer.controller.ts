import { CustomerOnly } from '@auth/decorators';
import type { AuthRequest } from '@auth/types';
import { ProductService } from '@domain/products/product.service';
import { PurchaseProductDtoSwagger } from '@domain/products/types';

import {
  Controller, Post, Param,
  Body, Request, ParseUUIDPipe
} from '@nestjs/common';

import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiParam, ApiBody
} from '@nestjs/swagger';


@ApiTags('products')
@Controller('products')
export class ProductCustomerController {
  constructor(private readonly productService: ProductService) { }

  @Post(':id/purchase')
  @CustomerOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Purchase product (Customer Only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: PurchaseProductDtoSwagger })
  @ApiResponse({
    status: 201,
    schema: {
      properties: {
        success: { type: 'boolean' },
        orderId: { type: 'string' },
        message: { type: 'string' }
      }
    }
  })
  async purchase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
    @Request() req: AuthRequest
  ) {
    const customerId = req.user.id;
    return this.productService.purchase(id, dto, customerId);
  }
}