//! trash

// import {
//   Controller,
//   Get, Post, Put, Delete,
//   Param, Body, Request, Query,
//   ParseUUIDPipe, BadRequestException,
//   UploadedFiles, UseInterceptors,
//   HttpCode, HttpStatus,
//   ClassSerializerInterceptor,
//   UseInterceptors as UseCustomInterceptors,
// } from '@nestjs/common';

// import {
//   ApiTags, ApiOperation, ApiResponse,
//   ApiBearerAuth, ApiBody, ApiParam,
//   ApiQuery, ApiOkResponse, ApiNotFoundResponse,
//   ApiForbiddenResponse, ApiBadRequestResponse,
//   ApiConsumes, ApiCreatedResponse,
// } from '@nestjs/swagger';
// import { FilesInterceptor } from '@nestjs/platform-express';

// import type {
//   CreateProductDto,
//   UpdateProductDto,
//   PurchaseProductDto,
//   RestockProductDto
// } from '@domain/products/types';

// import {
//   Auth,
//   SupplierOnly,
//   SupplierOrAdmin,
//   CustomerOnly,
//   AdminOnly
// } from '../auth/decorators';

// import { ProductService } from '@domain/products/product.service';
// import type { AuthRequest } from '../auth/types';

// // Swagger DTOs
// import {
//   CreateProductDtoSwagger,
//   UpdateProductDtoSwagger,
//   PurchaseProductDtoSwagger,
//   RestockProductDtoSwagger,
//   ProductResponseDtoSwagger,
//   ProductPublicResponseDtoSwagger,
//   ProductsListResponseDtoSwagger,
//   ProductStatisticsResponseDtoSwagger,
//   CategoryResponseDtoSwagger,
//   AddImagesDtoSwagger,
//   RemoveImageDtoSwagger,
//   UpdateProductStatusDtoSwagger,
//   SuccessResponseProductDtoSwagger
// } from '@domain/products/types/product.swagger.dto';


// @ApiTags('products')
// @Controller('products')
// @UseCustomInterceptors(ClassSerializerInterceptor)
// export class ProductController {
//   constructor(private readonly productService: ProductService) { }

//   // ================= PUBLIC ENDPOINTS =================

//   /**
//    * GET ALL PRODUCTS (Public)
//    * @description Retrieves products with optional filtering, pagination, and search.
//    * Public endpoint accessible without authentication.
//    */
//   @Get()
//   @ApiOperation({
//     summary: 'Get all products (Public)',
//     description: 'Retrieves products with optional filtering, pagination, and search. Public endpoint accessible without authentication.'
//   })
//   @ApiQuery({
//     name: 'category',
//     required: false,
//     description: 'Filter by category',
//     example: 'electronics',
//   })
//   @ApiQuery({
//     name: 'page',
//     required: false,
//     description: 'Page number for pagination',
//     example: 1,
//   })
//   @ApiQuery({
//     name: 'limit',
//     required: false,
//     description: 'Items per page',
//     example: 10,
//   })
//   @ApiQuery({
//     name: 'search',
//     required: false,
//     description: 'Search query for product name or description',
//     example: 'laptop',
//   })
//   @ApiOkResponse({
//     description: 'Products retrieved successfully',
//     type: ProductsListResponseDtoSwagger,
//   })
//   async findAll(
//     @Query('id') id?: string,
//     @Query('page') page?: string,
//     @Query('limit') limit?: string,
//     @Query('search') search?: string
//   ) {
//     if (search) {
//       return this.productService.searchByText(search);
//     }

//     if (id) {
//       return this.productService.findByCategoryId(id);
//     }

//     if (page || limit) {
//       const pageNum = parseInt(page || '1');
//       const limitNum = parseInt(limit || '10');
//       return this.productService.getPaginated(pageNum, limitNum);
//     }

//     return this.productService.findAll();
//   }

//   /**
//    * GET PRODUCT BY ID (Public)
//    * @description Retrieves detailed information about a specific product by ID.
//    * Public endpoint accessible without authentication.
//    */
//   @Get(':id')
//   @ApiOperation({
//     summary: 'Get product by ID (Public)',
//     description: 'Retrieves detailed information about a specific product by ID. Public endpoint accessible without authentication.'
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'Product ID (UUID format)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @ApiOkResponse({
//     description: 'Product details retrieved successfully',
//     type: ProductPublicResponseDtoSwagger,
//   })
//   @ApiNotFoundResponse({
//     description: 'Product not found or not active',
//   })
//   async findById(@Param('id', ParseUUIDPipe) id: string) {
//     return this.productService.findById(id);
//   }

//   /**
//    * GET PRODUCT CATEGORIES (Public)
//    * @description Retrieves list of all available product categories.
//    * Public endpoint accessible without authentication.
//    */
//   @Get('categories/list')
//   @ApiOperation({
//     summary: 'Get product categories (Public)',
//     description: 'Retrieves list of all available product categories. Public endpoint accessible without authentication.'
//   })
//   @ApiOkResponse({
//     description: 'Categories list retrieved successfully',
//     type: CategoryResponseDtoSwagger,
//   })
//   async getCategories() {
//     return this.productService.getCategories();
//   }

//   // ================= SUPPLIER ENDPOINTS =================

//   // ================= SUPPLIER ENDPOINTS =================

//   /**
//    * CREATE NEW PRODUCT (Supplier Only)
//    * @description Creates a new product listing. Supports image uploads (max 4 files).
//    * Supplier-only endpoint requiring SUPPLIER role.
//    */
//   @Post()
//   @SupplierOnly()
//   @UseInterceptors(FilesInterceptor('images', 4))
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Create new product (Supplier Only)',
//     description: 'Creates a new product listing. Supports image uploads (max 4 files). Supplier-only endpoint requiring SUPPLIER role.'
//   })
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({ type: CreateProductDtoSwagger })
//   @ApiCreatedResponse({
//     description: 'Product created successfully',
//     type: ProductResponseDtoSwagger,
//   })
//   @ApiBadRequestResponse({
//     description: 'Invalid product data or missing required fields',
//   })
//   @ApiForbiddenResponse({
//     description: 'User is not a supplier',
//   })
//   async create(
//     @Body() body: any, // Изменяем на any
//     @UploadedFiles() images: Express.Multer.File[],
//     @Request() req: AuthRequest
//   ) {
//     console.log('ProductController.create - body:', body);
//     console.log('ProductController.create - body.data:', body?.data);
//     console.log('ProductController.create - typeof body.data:', typeof body?.data);

//     let dto: CreateProductDto;

//     try {
//       // Если есть поле data и оно строка - парсим его
//       if (body.data && typeof body.data === 'string') {
//         dto = JSON.parse(body.data) as CreateProductDto;
//       }
//       // Если нет поля data, возможно body уже содержит DTO
//       else if (body.name) {
//         dto = body as CreateProductDto;
//       }
//       // Если весь body - JSON-строка
//       else if (typeof body === 'string') {
//         dto = JSON.parse(body) as CreateProductDto;
//       }
//       // Если data это уже объект
//       else if (body.data && typeof body.data === 'object') {
//         dto = body.data as CreateProductDto;
//       }
//       else {
//         console.error('Unknown body format:', body);
//         throw new BadRequestException('Invalid request format. Expected JSON data in "data" field.');
//       }

//       console.log('Parsed DTO:', dto);
//       console.log('DTO.name:', dto.name);

//     } catch (error) {
//       console.error('Failed to parse product data:', error);
//       throw new BadRequestException('Invalid product data format. Expected valid JSON.');
//     }

//     // Базовые проверки
//     if (!dto.name || !dto.name.trim()) {
//       throw new BadRequestException('Product name is required');
//     }

//     if (!dto.description || !dto.description.trim()) {
//       throw new BadRequestException('Product description is required');
//     }

//     if (dto.price === undefined || dto.price < 0) {
//       throw new BadRequestException('Valid price is required');
//     }

//     const userId = req.user.id;
//     return this.productService.create(dto, userId, images);
//   }

//   /**
//    * UPDATE PRODUCT (Supplier or Admin)
//    * @description Updates an existing product. Supports adding new images (max 4 files).
//    * Supplier can update their own products, admin can update any product.
//    */
//   @Put(':id')
//   @SupplierOrAdmin()
//   @UseInterceptors(FilesInterceptor('newImages', 4))
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Update product (Supplier or Admin)',
//     description: 'Updates an existing product. Supports adding new images (max 4 files). Supplier can update their own products, admin can update any product.'
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'Product ID (UUID format)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({ type: UpdateProductDtoSwagger })
//   @ApiOkResponse({
//     description: 'Product updated successfully',
//     type: ProductResponseDtoSwagger,
//   })
//   @ApiNotFoundResponse({
//     description: 'Product not found',
//   })
//   @ApiForbiddenResponse({
//     description: 'User not authorized to update this product',
//   })
//   async update(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() body: any, // Изменяем на any
//     @UploadedFiles() newImages: Express.Multer.File[],
//     @Request() req: AuthRequest
//   ) {
//     console.log('ProductController.update - body:', body);

//     let dto: UpdateProductDto;

//     try {
//       // Если есть поле data и оно строка - парсим его
//       if (body.data && typeof body.data === 'string') {
//         dto = JSON.parse(body.data) as UpdateProductDto;
//       }
//       // Если нет поля data, возможно body уже содержит DTO
//       else if (body.name || body.price !== undefined || body.stock !== undefined) {
//         dto = body as UpdateProductDto;
//       }
//       // Если весь body - JSON-строка
//       else if (typeof body === 'string') {
//         dto = JSON.parse(body) as UpdateProductDto;
//       }
//       // Если data это уже объект
//       else if (body.data && typeof body.data === 'object') {
//         dto = body.data as UpdateProductDto;
//       }
//       else {
//         console.error('Unknown body format:', body);
//         throw new BadRequestException('Invalid request format. Expected JSON data in "data" field.');
//       }

//       console.log('Parsed update DTO:', dto);

//     } catch (error) {
//       console.error('Failed to parse update data:', error);
//       throw new BadRequestException('Invalid update data format. Expected valid JSON.');
//     }

//     const userId = req.user.id;
//     const userRoles = req.user.roles;
//     return this.productService.update(id, dto, userId, userRoles, newImages);
//   }

//   /**
//    * ADD IMAGES TO PRODUCT (Supplier or Admin)
//    * @description Adds additional images to an existing product (max 10 files).
//    * Supplier can add images to their own products, admin can add to any product.
//    */
//   @Post(':id/images')
//   @SupplierOrAdmin()
//   @UseInterceptors(FilesInterceptor('images', 10))
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Add images to product (Supplier or Admin)',
//     description: 'Adds additional images to an existing product (max 10 files). Supplier can add images to their own products, admin can add to any product.'
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'Product ID (UUID format)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({ type: AddImagesDtoSwagger })
//   @ApiCreatedResponse({
//     description: 'Images added successfully',
//     schema: {
//       properties: {
//         success: { type: 'boolean', example: true },
//         urls: { type: 'array', items: { type: 'string' } },
//         message: { type: 'string', example: '3 image(s) added successfully' },
//       },
//     },
//   })
//   async addImages(
//     @Param('id', ParseUUIDPipe) id: string,
//     @UploadedFiles() images: Express.Multer.File[],
//     @Request() req: AuthRequest
//   ) {
//     const userId = req.user.id;
//     const userRoles = req.user.roles;

//     const uploadedUrls = await this.productService.addImages(
//       id,
//       userId,
//       userRoles,
//       images
//     );

//     return {
//       success: true,
//       urls: uploadedUrls,
//       message: `${uploadedUrls.length} image(s) added successfully`
//     };
//   }

//   /**
//    * REMOVE IMAGE FROM PRODUCT (Supplier or Admin)
//    * @description Removes a specific image from a product.
//    * Supplier can remove images from their own products, admin can remove from any product.
//    */
//   @Delete(':id/images')
//   @SupplierOrAdmin()
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Remove image from product (Supplier or Admin)',
//     description: 'Removes a specific image from a product. Supplier can remove images from their own products, admin can remove from any product.'
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'Product ID (UUID format)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @ApiBody({ type: RemoveImageDtoSwagger })
//   @ApiOkResponse({
//     description: 'Image removed successfully',
//     type: SuccessResponseProductDtoSwagger,
//   })
//   @ApiBadRequestResponse({
//     description: 'Image URL is required',
//   })
//   @ApiNotFoundResponse({
//     description: 'Product or image not found',
//   })
//   async removeImage(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() body: { imageUrl: string },
//     @Request() req: AuthRequest
//   ) {
//     const userId = req.user.id;
//     const userRoles = req.user.roles;

//     if (!body.imageUrl) {
//       throw new BadRequestException('imageUrl is required');
//     }

//     await this.productService.removeImage(
//       id,
//       userId,
//       userRoles,
//       body.imageUrl
//     );

//     return {
//       success: true,
//       message: 'Image removed successfully'
//     };
//   }

//   /**
//    * GET SUPPLIER'S PRODUCTS (Supplier Only)
//    * @description Retrieves all products belonging to the currently authenticated supplier.
//    * Supplier-only endpoint for managing own products.
//    */
//   @Get('supplier/my')
//   @SupplierOnly()
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Get my products (Supplier Only)',
//     description: 'Retrieves all products belonging to the currently authenticated supplier. Supplier-only endpoint for managing own products.'
//   })
//   @ApiOkResponse({
//     description: 'Supplier products retrieved successfully',
//     type: ProductsListResponseDtoSwagger,
//   })
//   @ApiForbiddenResponse({
//     description: 'User is not a supplier',
//   })
//   async getMyProducts(@Request() req: AuthRequest) {
//     const supplierId = req.user.id;
//     const userRoles = req.user.roles;
//     return this.productService.getSupplierProducts(supplierId, supplierId, userRoles);
//   }

//   /**
//    * RESTOCK PRODUCT (Supplier Only)
//    * @description Increases stock quantity for a product.
//    * Supplier can only restock their own products.
//    */
//   @Post(':id/restock')
//   @SupplierOnly()
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Restock product (Supplier Only)',
//     description: 'Increases stock quantity for a product. Supplier can only restock their own products.'
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'Product ID (UUID format)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @ApiBody({ type: RestockProductDtoSwagger })
//   @ApiOkResponse({
//     description: 'Product restocked successfully',
//     type: ProductResponseDtoSwagger,
//   })
//   @ApiNotFoundResponse({
//     description: 'Product not found',
//   })
//   @ApiForbiddenResponse({
//     description: 'User not authorized to restock this product',
//   })
//   async restock(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() dto: RestockProductDto,
//     @Request() req: AuthRequest
//   ) {
//     const userId = req.user.id;
//     const userRoles = req.user.roles;
//     return this.productService.restockProduct(id, dto, userId, userRoles);
//   }

//   // ================= CUSTOMER ENDPOINTS =================

//   /**
//    * PURCHASE PRODUCT (Customer Only)
//    * @description Processes a product purchase for a customer.
//    * Customer-only endpoint for making purchases.
//    */
//   @Post(':id/purchase')
//   @CustomerOnly()
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Purchase product (Customer Only)',
//     description: 'Processes a product purchase for a customer. Customer-only endpoint for making purchases.'
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'Product ID (UUID format)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @ApiBody({ type: PurchaseProductDtoSwagger })
//   @ApiCreatedResponse({
//     description: 'Purchase completed successfully',
//     schema: {
//       properties: {
//         success: { type: 'boolean', example: true },
//         orderId: { type: 'string', example: 'order_123456' },
//         message: { type: 'string', example: 'Purchase successful' },
//       },
//     },
//   })
//   @ApiBadRequestResponse({
//     description: 'Insufficient stock or invalid quantity',
//   })
//   async purchase(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() dto: PurchaseProductDto,
//     @Request() req: AuthRequest
//   ) {
//     const customerId = req.user.id;
//     return this.productService.purchase(id, dto, customerId);
//   }

//   // ================= SHARED ENDPOINTS =================

//   /**
//    * DELETE PRODUCT (Supplier or Admin)
//    * @description Deletes a product. Supplier can delete their own products, admin can delete any product.
//    */
//   @Delete(':id')
//   @SupplierOrAdmin()
//   @HttpCode(HttpStatus.NO_CONTENT)
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Delete product (Supplier or Admin)',
//     description: 'Deletes a product. Supplier can delete their own products, admin can delete any product.'
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'Product ID (UUID format)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @ApiResponse({
//     status: HttpStatus.NO_CONTENT,
//     description: 'Product deleted successfully',
//   })
//   @ApiNotFoundResponse({
//     description: 'Product not found',
//   })
//   @ApiForbiddenResponse({
//     description: 'User not authorized to delete this product',
//   })
//   async delete(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Request() req: AuthRequest
//   ) {
//     const userId = req.user.id;
//     const userRoles = req.user.roles;
//     return this.productService.delete(id, userId, userRoles);
//   }

//   /**
//    * UPDATE PRODUCT STATUS (Supplier or Admin)
//    * @description Updates the status of a product (active, inactive, archived, draft).
//    * Supplier can update status of their own products, admin can update any product.
//    */
//   @Put(':id/status')
//   @SupplierOrAdmin()
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Update product status (Supplier or Admin)',
//     description: 'Updates the status of a product (active, inactive, archived, draft). Supplier can update status of their own products, admin can update any product.'
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'Product ID (UUID format)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @ApiBody({ type: UpdateProductStatusDtoSwagger })
//   @ApiOkResponse({
//     description: 'Product status updated successfully',
//     type: ProductResponseDtoSwagger,
//   })
//   @ApiBadRequestResponse({
//     description: 'Invalid status value',
//   })
//   async updateStatus(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() dto: { status: string },
//     @Request() req: AuthRequest
//   ) {
//     const userId = req.user.id;
//     const userRoles = req.user.roles;

//     const validStatuses = ['active', 'inactive', 'archived', 'draft'];
//     if (!validStatuses.includes(dto.status)) {
//       throw new BadRequestException('Invalid status');
//     }

//     return this.productService.toggleStatus(id, dto.status as any, userId, userRoles);
//   }

//   /**
//    * CHECK PRODUCT OWNERSHIP (Authenticated)
//    * @description Checks if the authenticated user owns or has access to a product.
//    * Returns ownership information and permissions.
//    */
//   @Get(':id/ownership')
//   @Auth()
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Check product ownership (Authenticated)',
//     description: 'Checks if the authenticated user owns or has access to a product. Returns ownership information and permissions.'
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'Product ID (UUID format)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @ApiOkResponse({
//     description: 'Ownership information retrieved',
//     schema: {
//       properties: {
//         isOwner: { type: 'boolean', example: true },
//         isSupplier: { type: 'boolean', example: true },
//         isAdmin: { type: 'boolean', example: false },
//         canEdit: { type: 'boolean', example: true },
//         canDelete: { type: 'boolean', example: true },
//       },
//     },
//   })
//   async checkOwnership(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Request() req: AuthRequest
//   ) {
//     const userId = req.user.id;
//     return this.productService.checkOwnership(id, userId);
//   }

//   // ================= ADMIN ENDPOINTS =================

//   /**
//    * GET PRODUCT STATISTICS (Admin Only)
//    * @description Retrieves comprehensive product statistics and analytics.
//    * Admin-only endpoint requiring ADMIN role.
//    */
//   @Get('admin/statistics')
//   @AdminOnly()
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Get product statistics (Admin Only)',
//     description: 'Retrieves comprehensive product statistics and analytics. Admin-only endpoint requiring ADMIN role.'
//   })
//   @ApiOkResponse({
//     description: 'Product statistics retrieved successfully',
//     type: ProductStatisticsResponseDtoSwagger,
//   })
//   @ApiForbiddenResponse({
//     description: 'User is not an administrator',
//   })
//   async getStatistics() {
//     return this.productService.getStatistics();
//   }

//   /**
//    * GET ALL PRODUCTS (Admin Only)
//    * @description Retrieves all products including inactive and archived ones.
//    * Admin-only endpoint with optional status filtering.
//    */
//   @Get('admin/all')
//   @AdminOnly()
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Get all products (Admin Only)',
//     description: 'Retrieves all products including inactive and archived ones. Admin-only endpoint with optional status filtering.'
//   })
//   @ApiQuery({
//     name: 'status',
//     required: false,
//     description: 'Filter by product status',
//     example: 'inactive',
//     enum: ['active', 'inactive', 'archived', 'draft'],
//   })
//   @ApiOkResponse({
//     description: 'All products retrieved successfully',
//     type: ProductsListResponseDtoSwagger,
//   })
//   async getAllProducts(@Query('status') status?: string) {
//     const filter: any = {};
//     if (status) {
//       filter.status = status;
//     }
//     return this.productService.getAllProducts(filter);
//   }

//   /**
//    * FORCE DELETE PRODUCT (Admin Only)
//    * @description Permanently deletes a product from the system (bypasses soft delete).
//    * Admin-only endpoint for emergency removal.
//    */
//   @Delete('admin/:id/force')
//   @AdminOnly()
//   @HttpCode(HttpStatus.NO_CONTENT)
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Force delete product (Admin Only)',
//     description: 'Permanently deletes a product from the system (bypasses soft delete). Admin-only endpoint for emergency removal.'
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'Product ID (UUID format)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @ApiResponse({
//     status: HttpStatus.NO_CONTENT,
//     description: 'Product force deleted successfully',
//   })
//   @ApiNotFoundResponse({
//     description: 'Product not found',
//   })
//   async forceDelete(@Param('id', ParseUUIDPipe) id: string) {
//     return this.productService.forceDelete(id);
//   }

//   /**
//    * GET LOW STOCK PRODUCTS (Admin Only)
//    * @description Retrieves products with stock below a specified threshold.
//    * Admin-only endpoint for inventory management.
//    */
//   @Get('admin/low-stock')
//   @AdminOnly()
//   @ApiBearerAuth('JWT-auth')
//   @ApiOperation({
//     summary: 'Get low stock products (Admin Only)',
//     description: 'Retrieves products with stock below a specified threshold. Admin-only endpoint for inventory management.'
//   })
//   @ApiQuery({
//     name: 'threshold',
//     required: false,
//     description: 'Stock threshold (default: 10)',
//     example: 5,
//   })
//   @ApiOkResponse({
//     description: 'Low stock products retrieved successfully',
//     type: ProductsListResponseDtoSwagger,
//   })
//   async getLowStockProducts(@Query('threshold') threshold?: string) {
//     const thresholdNum = threshold ? parseInt(threshold) : 10;
//     return this.productService.getLowStockProducts(thresholdNum);
//   }
// }