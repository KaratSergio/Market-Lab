import {
  Controller, Get, Post, Put,
  Delete, Body, Param, Query, ParseUUIDPipe,
  ParseIntPipe, DefaultValuePipe, HttpCode, HttpStatus
} from '@nestjs/common';

import {
  ApiTags, ApiOperation,
  ApiBearerAuth, ApiQuery, ApiParam
} from '@nestjs/swagger';

import {
  CreateTagDto,
  UpdateTagDto,
  TagFiltersDto
} from '@domain/tags/types';

import { Role } from '@shared/types';
import { Auth, Roles } from '@auth/decorators';
import { TagService } from '@domain/tags/tag.service';
import { type LanguageCode, SUPPORTED_LANGUAGES } from '@domain/translations/types/translation.type';


@ApiTags('Tags')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) { }

  // PUBLIC ENDPOINTS

  @Get()
  @ApiOperation({ summary: 'Get all tags with optional filters and localization' })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES),
    description: 'Language code for localization'
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('language') language?: LanguageCode,
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'inactive',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number
  ) {
    if (search) return this.tagService.searchTags(search, limit, language);

    const filters: TagFiltersDto = { page, limit };
    if (status) filters.status = status;

    // For now, just return all tags (pagination can be implemented later)
    const tags = await this.tagService.findAll(language);

    if (status) return tags.filter(t => t.status === status);
    return tags;
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular tags with product count' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 20 })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES)
  })
  async getPopularTags(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('language') language?: LanguageCode
  ) {
    return this.tagService.getPopularTags(limit, language);
  }

  @Get('with-counts')
  @ApiOperation({ summary: 'Get all tags with product counts' })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES)
  })
  async getTagsWithCounts(@Query('language') language?: LanguageCode) {
    return this.tagService.getTagsWithProductCount(language);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get tags for a specific product' })
  @ApiParam({ name: 'productId', type: String })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES)
  })
  async getProductTags(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('language') language?: LanguageCode
  ) {
    return this.tagService.getProductTags(productId, language);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search tags by name' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES)
  })
  async searchTags(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('language') language?: LanguageCode
  ) {
    return this.tagService.searchTags(query, limit, language);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get tag by slug' })
  @ApiParam({ name: 'slug', type: String })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES)
  })
  async getBySlug(
    @Param('slug') slug: string,
    @Query('language') language?: LanguageCode
  ) {
    return this.tagService.findBySlug(slug, language);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES)
  })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('language') language?: LanguageCode
  ) {
    return this.tagService.findById(id, language);
  }

  @Get(':id/translations')
  @ApiOperation({ summary: 'Get all translations for tag' })
  @ApiParam({ name: 'id', type: String })
  async getTranslations(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagService.getTagTranslations(id);
  }

  // ADMIN ENDPOINTS

  @Post()
  @ApiBearerAuth()
  @Auth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create new tag with translations (Admin only)' })
  async create(@Body() createDto: CreateTagDto) {
    return this.tagService.create(createDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Auth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update tag with translations (Admin only)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTagDto
  ) {
    return this.tagService.update(id, updateDto);
  }

  @Put(':id/translations')
  @ApiBearerAuth()
  @Auth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update tag translations (Admin only)' })
  async updateTranslations(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() translations: Record<LanguageCode, Record<string, string>>
  ) {
    await this.tagService.updateTagTranslations(id, translations);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Auth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete tag and its translations (Admin only)' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagService.delete(id);
  }

  @Delete(':id/translations')
  @ApiBearerAuth()
  @Auth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tag translations (Admin only)' })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES)
  })
  @ApiQuery({
    name: 'field',
    required: false,
    description: 'Field name to delete translations for'
  })
  async deleteTranslations(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('language') language?: LanguageCode,
    @Query('field') field?: string
  ) {
    await this.tagService.deleteTagTranslations(id, language, field);
  }

  @Put(':id/status/:status')
  @ApiBearerAuth()
  @Auth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Change tag status (Admin only)' })
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status') status: 'active' | 'inactive'
  ) {
    return this.tagService.toggleStatus(id, status);
  }

  @Post('product/:productId/sync')
  @ApiBearerAuth()
  @Auth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Sync tags for a product (Admin only)' })
  async syncProductTags(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: { tagIds: string[] }
  ) {
    await this.tagService.syncProductTags(productId, body.tagIds);
    return { message: 'Product tags synchronized successfully' };
  }

  @Post('merge')
  @ApiBearerAuth()
  @Auth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Merge two tags (Admin only)' })
  async mergeTags(
    @Body() body: { sourceTagId: string; targetTagId: string }
  ) {
    return this.tagService.mergeTags(body.sourceTagId, body.targetTagId);
  }

  @Get('by-category/:categoryId')
  @ApiOperation({ summary: 'Get tags by category ID' })
  @ApiParam({ name: 'categoryId', type: String })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES)
  })
  async getByCategoryId(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query('language') language?: LanguageCode
  ) {
    return this.tagService.findByCategoryId(categoryId, language);
  }

  @Get('by-category-slug/:slug')
  @ApiOperation({ summary: 'Get tags by category slug' })
  @ApiParam({ name: 'slug', type: String })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES)
  })
  async getByCategorySlug(
    @Param('slug') slug: string,
    @Query('language') language?: LanguageCode
  ) {
    return this.tagService.findByCategorySlug(slug, language);
  }
}