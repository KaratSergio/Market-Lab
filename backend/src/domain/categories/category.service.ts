import {
  Injectable, Inject, NotFoundException,
  ConflictException, BadRequestException
} from '@nestjs/common';

import {
  CreateCategoryDto, UpdateCategoryDto,
  CategoryTreeItem, CategoryStatus, BasicCategory
} from './types';

import {
  LanguageCode,
  DEFAULT_LANGUAGE
} from '@domain/translations/types';

import { CategoryRepository } from './category.repository';
import { TranslationService } from '../translations/translation.service';
import { CategoryDomainEntity } from './category.entity';


@Injectable()
export class CategoryService {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    @Inject(TranslationService)
    private readonly translationService: TranslationService
  ) { }

  // PUBLIC METHODS

  async findAll(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<CategoryDomainEntity[]> {
    const categories = await this.categoryRepository.findAll();
    return this.applyTranslationsToCategories(categories, languageCode);
  }

  async findActive(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<CategoryDomainEntity[]> {
    const categories = await this.categoryRepository.findActive();
    return this.applyTranslationsToCategories(categories, languageCode);
  }

  async findById(id: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<CategoryDomainEntity> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return this.applyTranslationsToCategory(category, languageCode);
  }

  async findBySlug(slug: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<CategoryDomainEntity> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) throw new NotFoundException(`Category ${slug} not found`);
    return this.applyTranslationsToCategory(category, languageCode);
  }

  async getParents(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<CategoryDomainEntity[]> {
    const parents = await this.categoryRepository.findParents();
    return this.applyTranslationsToCategories(parents, languageCode);
  }

  async getChildren(parentId: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<CategoryDomainEntity[]> {
    await this.ensureCategoryExists(parentId);
    const children = await this.categoryRepository.findChildren(parentId);
    return this.applyTranslationsToCategories(children, languageCode);
  }

  async getTree(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<CategoryTreeItem[]> {
    const tree = await this.categoryRepository.getTree();
    return this.applyTranslationsToTree(tree, languageCode);
  }

  // ADMIN METHODS 

  async create(createDto: CreateCategoryDto): Promise<CategoryDomainEntity> {
    const slug = createDto.slug || this.generateSlug(createDto.name);
    if (await this.categoryRepository.existsBySlug(slug)) throw new ConflictException(`Category with slug "${slug}" already exists`);
    if (createDto.parentId) await this.ensureCategoryExists(createDto.parentId);

    const category = CategoryDomainEntity.create({
      ...createDto,
      slug
    });

    const errors = category.validate();
    if (errors.length > 0) throw new BadRequestException(errors.join(', '));

    const savedCategory = await this.categoryRepository.create(category);

    if (createDto.translations) {
      await this.translationService.saveTranslations(
        savedCategory.id,
        'category',
        createDto.translations
      );
    }

    return this.findById(savedCategory.id);
  }

  async update(id: string, updateDto: UpdateCategoryDto): Promise<CategoryDomainEntity> {
    const category = await this.categoryRepository.findById(id);

    if (!category) throw new NotFoundException(`Category ${id} not found`);
    if (updateDto.slug && updateDto.slug !== category.slug) {
      if (await this.categoryRepository.existsBySlug(updateDto.slug)) {
        throw new ConflictException(`Category with slug "${updateDto.slug}" already exists`);
      }
    }
    if (updateDto.parentId === id) throw new BadRequestException('Category cannot be its own parent');
    if (updateDto.parentId !== undefined && updateDto.parentId !== category.parentId) {
      if (updateDto.parentId !== null) await this.ensureCategoryExists(updateDto.parentId);
      if (updateDto.parentId && await this.wouldCreateCycle(id, updateDto.parentId)) {
        throw new BadRequestException('Cannot create circular category hierarchy');
      }
    }

    category.update(updateDto);

    const errors = category.validate();
    if (errors.length > 0) throw new BadRequestException(errors.join(', '));

    const updated = await this.categoryRepository.update(id, category);
    if (!updated) throw new NotFoundException(`Category ${id} not found after update`);

    if (updateDto.translations) {
      await this.translationService.saveTranslations(
        id,
        'category',
        updateDto.translations
      );
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    const canDelete = await this.canDeleteCategory(id);
    if (!canDelete.canDelete) throw new BadRequestException(canDelete.reason);

    await this.translationService.deleteTranslations(id, 'category');
    await this.categoryRepository.delete(id);
  }

  async toggleStatus(id: string, status: CategoryStatus): Promise<CategoryDomainEntity> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    if (status === 'active') {
      category.activate();
      if (category.isChild()) {
        const parent = await this.categoryRepository.findById(category.parentId!);
        if (parent && !parent.isActive()) throw new BadRequestException('Parent category must be active');
      }
    } else {
      category.deactivate();
      if (category.isParent()) {
        const children = await this.categoryRepository.findChildren(id);
        for (const child of children) {
          if (child.isActive()) {
            child.deactivate();
            await this.categoryRepository.update(child.id, child);
          }
        }
      }
    }

    const updated = await this.categoryRepository.update(id, category);
    if (!updated) throw new NotFoundException(`Category ${id} not found after update`);

    return this.findById(id);
  }

  async reorderCategories(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.categoryRepository.update(orderedIds[i], { order: i });
    }
  }

  async getCategoryTranslations(id: string): Promise<Record<string, Record<string, string>>> {
    const translations = await this.translationService.getEntityTranslations(id, 'category');
    return this.groupTranslationsByLanguage(translations);
  }

  async updateCategoryTranslations(
    id: string,
    translations: Record<LanguageCode, Record<string, string>>
  ): Promise<void> {
    await this.ensureCategoryExists(id);
    await this.translationService.saveTranslations(id, 'category', translations);
  }

  async deleteCategoryTranslations(
    id: string,
    languageCode?: LanguageCode,
    fieldName?: string
  ): Promise<void> {
    await this.ensureCategoryExists(id);
    await this.translationService.deleteTranslations(id, 'category', languageCode, fieldName);
  }

  // PRIVATE HELPER METHODS

  private async applyTranslationsToCategory(
    category: CategoryDomainEntity,
    languageCode: LanguageCode
  ): Promise<CategoryDomainEntity> {
    const translations = await this.translationService.getTranslationsForEntities(
      [category.id],
      'category',
      languageCode
    );

    const categoryTranslations = translations.filter(t => t.entityId === category.id);
    if (categoryTranslations.length === 0) return category;

    return this.mergeTranslations(category, categoryTranslations);
  }

  private async applyTranslationsToCategories(
    categories: CategoryDomainEntity[],
    languageCode: LanguageCode
  ): Promise<CategoryDomainEntity[]> {
    if (categories.length === 0) return [];

    const categoryIds = categories.map(c => c.id);
    const translations = await this.translationService.getTranslationsForEntities(
      categoryIds,
      'category',
      languageCode
    );

    const translationsByCategory = this.groupTranslationsByEntityId(translations);

    return categories.map(category => {
      const categoryTranslations = translationsByCategory[category.id] || [];
      if (categoryTranslations.length === 0) return category;
      return this.mergeTranslations(category, categoryTranslations);
    });
  }

  private async applyTranslationsToTree(
    tree: CategoryTreeItem[],
    languageCode: LanguageCode
  ): Promise<CategoryTreeItem[]> {
    const categoryIds = this.extractCategoryIdsFromTree(tree);

    const translations = await this.translationService.getTranslationsForEntities(
      categoryIds,
      'category',
      languageCode
    );

    const translationsByCategory = this.groupTranslationsByEntityId(translations);

    const applyToNode = (node: CategoryTreeItem): CategoryTreeItem => {
      const nodeTranslations = translationsByCategory[node.id] || [];
      const localizedNode = nodeTranslations.length > 0
        ? this.mergeTranslationsToTreeItem(node, nodeTranslations)
        : node;

      const localizedChildren = node.children
        ? node.children.map(applyToNode)
        : [];

      return {
        ...localizedNode,
        children: localizedChildren
      };
    };

    return tree.map(applyToNode);
  }

  private mergeTranslations(
    category: CategoryDomainEntity,
    translations: any[]
  ): CategoryDomainEntity {
    const translationMap = translations.reduce((acc, t) => {
      acc[t.fieldName] = t.translationText;
      return acc;
    }, {} as Record<string, string>);

    return new CategoryDomainEntity(
      category.id,
      translationMap.name || category.name,
      category.slug,
      translationMap.description || category.description,
      category.status,
      category.imageUrl,
      category.parentId,
      category.order,
      translationMap.metaTitle || category.metaTitle,
      translationMap.metaDescription || category.metaDescription,
      category.createdAt,
      category.updatedAt
    );
  }

  private mergeTranslationsToTreeItem(
    category: BasicCategory,
    translations: any[]
  ): CategoryTreeItem {
    const translationMap = translations.reduce((acc, t) => {
      acc[t.fieldName] = t.translationText;
      return acc;
    }, {} as Record<string, string>);

    return {
      id: category.id,
      name: translationMap.name || category.name,
      slug: category.slug,
      description: translationMap.description || category.description,
      status: category.status,
      imageUrl: category.imageUrl,
      parentId: category.parentId,
      order: category.order,
      metaTitle: translationMap.metaTitle || category.metaTitle,
      metaDescription: translationMap.metaDescription || category.metaDescription,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      children: (category as CategoryTreeItem).children || []
    };
  }

  private groupTranslationsByEntityId(translations: any[]): Record<string, any[]> {
    return translations.reduce((acc, translation) => {
      if (!acc[translation.entityId]) {
        acc[translation.entityId] = [];
      }
      acc[translation.entityId].push(translation);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private groupTranslationsByLanguage(translations: any[]): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};

    translations.forEach(translation => {
      if (!result[translation.languageCode]) {
        result[translation.languageCode] = {};
      }
      result[translation.languageCode][translation.fieldName] = translation.translationText;
    });

    return result;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async ensureCategoryExists(id: string): Promise<void> {
    const exists = await this.categoryRepository.exists(id);
    if (!exists) throw new NotFoundException(`Category ${id} not found`);
  }

  private async wouldCreateCycle(categoryId: string, newParentId: string): Promise<boolean> {
    let currentParentId: string | null | undefined = newParentId;

    while (currentParentId) {
      if (currentParentId === categoryId) return true;
      const parent = await this.categoryRepository.findById(currentParentId);
      if (!parent) break;
      currentParentId = parent.parentId;
    }

    return false;
  }

  private async canDeleteCategory(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    const children = await this.categoryRepository.findChildren(id);
    if (children.length > 0) {
      return {
        canDelete: false,
        reason: 'Cannot delete category with children. Delete or move children first.'
      };
    }
    return { canDelete: true };
  }

  private extractCategoryIdsFromTree(tree: CategoryTreeItem[]): string[] {
    const ids: string[] = [];
    const traverse = (items: CategoryTreeItem[]) => {
      items.forEach(item => {
        ids.push(item.id);
        if (item.children) traverse(item.children);
      });
    };
    traverse(tree);
    return ids;
  }
}