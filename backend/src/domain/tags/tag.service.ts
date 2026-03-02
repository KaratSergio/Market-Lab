import {
  Injectable, Inject, NotFoundException,
  ConflictException, BadRequestException
} from '@nestjs/common';

import {
  CreateTagDto, UpdateTagDto,
  TagStatus, TagWithProductCount, PopularTag
} from './types';

import {
  LanguageCode,
  DEFAULT_LANGUAGE
} from '@domain/translations/types';

import { TagRepository } from './tag.repository';
import { TranslationService } from '../translations/translation.service';
import { TagDomainEntity } from './tag.entity';


@Injectable()
export class TagService {
  constructor(
    @Inject('TagRepository')
    private readonly tagRepository: TagRepository,
    private readonly translationService: TranslationService
  ) { }

  // PUBLIC METHODS

  async findAll(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<TagDomainEntity[]> {
    const tags = await this.tagRepository.findAll();
    return this._applyTranslationsToTags(tags, languageCode);
  }

  async findActive(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<TagDomainEntity[]> {
    const tags = await this.tagRepository.findActive();
    return this._applyTranslationsToTags(tags, languageCode);
  }

  async findById(id: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<TagDomainEntity> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);
    return this._applyTranslationsToTag(tag, languageCode);
  }

  async findBySlug(slug: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<TagDomainEntity> {
    const tag = await this.tagRepository.findBySlug(slug);
    if (!tag) throw new NotFoundException(`Tag ${slug} not found`);
    return this._applyTranslationsToTag(tag, languageCode);
  }

  async searchTags(query: string, limit: number = 10, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<TagDomainEntity[]> {
    const tags = await this.tagRepository.searchTags(query, limit);
    return this._applyTranslationsToTags(tags, languageCode);
  }

  async getPopularTags(limit: number = 20, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<PopularTag[]> {
    const popularTags = await this.tagRepository.getPopularTags(limit);

    if (languageCode !== DEFAULT_LANGUAGE) {
      const tagIds = popularTags.map(t => t.id);
      const translations = await this.translationService.getTranslationsForEntities(
        tagIds,
        'tag',
        languageCode
      );

      const translationsByTag = this._groupTranslationsByEntityId(translations);

      return popularTags.map(tag => {
        const tagTranslations = translationsByTag[tag.id] || [];
        if (tagTranslations.length === 0) return tag;

        return this._mergeTranslationsToPopularTag(tag, tagTranslations);
      });
    }

    return popularTags;
  }

  async getTagsWithProductCount(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<TagWithProductCount[]> {
    const tagsWithCount = await this.tagRepository.getTagsWithProductCount();
    const tagIds = tagsWithCount.map(t => t.tagId);

    const tags = await this.tagRepository.findMany({ id: { $in: tagIds } as any });
    const tagsMap = new Map(tags.map(t => [t.id, t]));

    if (languageCode !== DEFAULT_LANGUAGE) {
      const translations = await this.translationService.getTranslationsForEntities(
        tagIds,
        'tag',
        languageCode
      );
      const translationsByTag = this._groupTranslationsByEntityId(translations);

      return tagsWithCount.map(item => {
        const tag = tagsMap.get(item.tagId);
        if (!tag) return null;

        const tagTranslations = translationsByTag[item.tagId] || [];
        const translatedTag = tagTranslations.length > 0
          ? this._mergeTranslations(tag, tagTranslations)
          : tag;

        return {
          ...translatedTag,
          productCount: item.count
        };
      }).filter(Boolean) as TagWithProductCount[];
    }

    return tagsWithCount.map(item => {
      const tag = tagsMap.get(item.tagId);
      return tag ? { ...tag, productCount: item.count } : null;
    }).filter(Boolean) as TagWithProductCount[];
  }

  async getProductTags(productId: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<TagDomainEntity[]> {
    const tags = await this.tagRepository.getProductTags(productId);
    return this._applyTranslationsToTags(tags, languageCode);
  }

  async syncProductTags(productId: string, tagIds: string[]): Promise<void> {
    const currentTags = await this.tagRepository.getProductTags(productId);
    const currentTagIds = currentTags.map(t => t.id);

    const tagsToAdd = tagIds.filter(id => !currentTagIds.includes(id));
    const tagsToRemove = currentTagIds.filter(id => !tagIds.includes(id));

    await this._validateTagsExist(tagsToAdd);

    for (const tagId of tagsToAdd) {
      await this.tagRepository.addToProduct(tagId, productId);
      await this._incrementTagUsage(tagId);
    }

    for (const tagId of tagsToRemove) {
      await this.tagRepository.removeFromProduct(tagId, productId);
      await this._decrementTagUsage(tagId);
    }
  }

  // ADMIN METHODS

  async create(createDto: CreateTagDto): Promise<TagDomainEntity> {
    const slug = createDto.slug || this._generateSlug(createDto.name);

    await this._ensureTagDoesNotExist(slug, createDto.name);

    const tag = TagDomainEntity.create({
      ...createDto,
      slug
    });

    const errors = tag.validate();
    if (errors.length > 0) {
      throw new BadRequestException(errors.join(', '));
    }

    const savedTag = await this.tagRepository.create(tag);

    if (createDto.translations) {
      await this.translationService.saveTranslations(
        savedTag.id,
        'tag',
        createDto.translations
      );
    }

    return this.findById(savedTag.id);
  }

  async update(id: string, updateDto: UpdateTagDto): Promise<TagDomainEntity> {
    const tag = await this._ensureTagExists(id);
    await this._validateTagUpdate(tag, updateDto);
    tag.update(updateDto);

    const errors = tag.validate();
    if (errors.length > 0) throw new BadRequestException(errors.join(', '));

    const updatedTag = await this.tagRepository.update(id, tag);
    if (!updatedTag) throw new NotFoundException(`Tag ${id} not found after update`);

    if (updateDto.translations) {
      await this.translationService.saveTranslations(
        id,
        'tag',
        updateDto.translations
      );
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this._ensureTagExists(id);

    const canDelete = await this._canDeleteTag(id);
    if (!canDelete.canDelete) throw new BadRequestException(canDelete.reason);

    await this.translationService.deleteTranslations(id, 'tag');
    await this.tagRepository.delete(id);
  }

  async toggleStatus(id: string, status: TagStatus): Promise<TagDomainEntity> {
    const tag = await this._ensureTagExists(id);

    if (status === 'active') tag.activate();
    else tag.deactivate();

    const updatedTag = await this.tagRepository.update(id, tag);
    if (!updatedTag) throw new NotFoundException(`Tag ${id} not found after update`);

    return this.findById(id);
  }

  async getTagTranslations(
    id: string,
    languageCode?: LanguageCode
  ): Promise<Record<string, Record<string, string>> | Record<string, string>> {
    await this._ensureTagExists(id);

    if (languageCode) {
      const translations = await this.translationService.getTranslationsForEntities(
        [id],
        'tag',
        languageCode
      );

      const result: Record<string, string> = {};
      translations.forEach(t => {
        result[t.fieldName] = t.translationText;
      });

      return result;
    } else {
      const translations = await this.translationService.getEntityTranslations(id, 'tag');
      return this._groupTranslationsByLanguage(translations);
    }
  }

  async mergeTags(sourceTagId: string, targetTagId: string): Promise<TagDomainEntity> {
    await this._ensureTagExists(sourceTagId);
    const targetTag = await this._ensureTagExists(targetTagId);
    if (sourceTagId === targetTagId) throw new BadRequestException('Cannot merge tag with itself');

    const productsWithSource = await this.tagRepository.getProductTags(sourceTagId);

    if (productsWithSource.length > 0) {
      for (const product of productsWithSource) {
        await this.tagRepository.addToProduct(targetTagId, product.id);
        await this.tagRepository.removeFromProduct(sourceTagId, product.id);
      }

      targetTag.incrementUsage(productsWithSource.length);
      await this.tagRepository.update(targetTagId, targetTag);
    }

    const sourceTranslations = await this.translationService.getEntityTranslations(sourceTagId, 'tag');
    if (sourceTranslations && sourceTranslations.length > 0) {
      const translationsByLanguage = this._groupTranslationsByLanguage(sourceTranslations);
      await this.translationService.saveTranslations(
        targetTagId,
        'tag',
        translationsByLanguage as Record<LanguageCode, Record<string, string>>
      );
    }

    await this.translationService.deleteTranslations(sourceTagId, 'tag');
    await this.tagRepository.delete(sourceTagId);

    return this.findById(targetTagId);
  }

  async updateTagTranslations(
    id: string,
    translations: Record<LanguageCode, Record<string, string>>
  ): Promise<void> {
    await this._ensureTagExists(id);
    await this.translationService.saveTranslations(id, 'tag', translations);
  }

  async deleteTagTranslations(
    id: string,
    languageCode?: LanguageCode,
    fieldName?: string
  ): Promise<void> {
    await this._ensureTagExists(id);
    await this.translationService.deleteTranslations(id, 'tag', languageCode, fieldName);
  }

  // PRIVATE HELPER METHODS

  private async _applyTranslationsToTag(
    tag: TagDomainEntity,
    languageCode: LanguageCode
  ): Promise<TagDomainEntity> {
    if (languageCode === DEFAULT_LANGUAGE) return tag;

    const translations = await this.translationService.getTranslationsForEntities(
      [tag.id],
      'tag',
      languageCode
    );

    const tagTranslations = translations.filter(t => t.entityId === tag.id);
    if (tagTranslations.length === 0) return tag;

    return this._mergeTranslations(tag, tagTranslations);
  }

  private async _applyTranslationsToTags(
    tags: TagDomainEntity[],
    languageCode: LanguageCode
  ): Promise<TagDomainEntity[]> {
    if (tags.length === 0) return [];
    if (languageCode === DEFAULT_LANGUAGE) return tags;

    const tagIds = tags.map(t => t.id);
    const translations = await this.translationService.getTranslationsForEntities(
      tagIds,
      'tag',
      languageCode
    );

    const translationsByTag = this._groupTranslationsByEntityId(translations);

    return tags.map(tag => {
      const tagTranslations = translationsByTag[tag.id] || [];
      if (tagTranslations.length === 0) return tag;
      return this._mergeTranslations(tag, tagTranslations);
    });
  }

  private _mergeTranslations(
    tag: TagDomainEntity,
    translations: any[]
  ): TagDomainEntity {
    const translationMap = translations.reduce((acc, t) => {
      acc[t.fieldName] = t.translationText;
      return acc;
    }, {} as Record<string, string>);

    return new TagDomainEntity(
      tag.id,
      translationMap.name || tag.name,
      tag.slug,
      translationMap.description || tag.description,
      tag.status,
      tag.usageCount,
      tag.createdAt,
      tag.updatedAt
    );
  }

  private _mergeTranslationsToPopularTag(
    popularTag: PopularTag,
    translations: any[]
  ): PopularTag {
    const translationMap = translations.reduce((acc, t) => {
      acc[t.fieldName] = t.translationText;
      return acc;
    }, {} as Record<string, string>);

    return {
      id: popularTag.id,
      name: translationMap.name || popularTag.name,
      slug: popularTag.slug,
      productCount: popularTag.productCount
    };
  }

  private _groupTranslationsByEntityId(translations: any[]): Record<string, any[]> {
    return translations.reduce((acc, translation) => {
      if (!acc[translation.entityId]) {
        acc[translation.entityId] = [];
      }
      acc[translation.entityId].push(translation);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private _groupTranslationsByLanguage(translations: any[]): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};

    translations.forEach(translation => {
      if (!result[translation.languageCode]) {
        result[translation.languageCode] = {};
      }
      result[translation.languageCode][translation.fieldName] = translation.translationText;
    });

    return result;
  }

  private _generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async _ensureTagExists(id: string): Promise<TagDomainEntity> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);
    return tag;
  }

  private async _ensureTagDoesNotExist(slug: string, name: string): Promise<void> {
    if (await this.tagRepository.existsBySlug(slug)) {
      throw new ConflictException(`Tag with slug "${slug}" already exists`);
    }
    if (await this.tagRepository.existsByName(name)) {
      throw new ConflictException(`Tag with name "${name}" already exists`);
    }
  }

  private async _validateTagUpdate(tag: TagDomainEntity, updateDto: UpdateTagDto): Promise<void> {
    if (updateDto.slug && updateDto.slug !== tag.slug) {
      if (await this.tagRepository.existsBySlug(updateDto.slug)) {
        throw new ConflictException(`Tag with slug "${updateDto.slug}" already exists`);
      }
    }
    if (updateDto.name && updateDto.name !== tag.name) {
      if (await this.tagRepository.existsByName(updateDto.name)) {
        throw new ConflictException(`Tag with name "${updateDto.name}" already exists`);
      }
    }
  }

  private async _validateTagsExist(tagIds: string[]): Promise<void> {
    for (const tagId of tagIds) {
      const tag = await this.tagRepository.findById(tagId);
      if (!tag) throw new NotFoundException(`Tag ${tagId} not found`);
      if (!tag.isActive()) throw new BadRequestException(`Tag ${tag.name} is not active`);
    }
  }

  private async _incrementTagUsage(tagId: string): Promise<void> {
    const tag = await this.tagRepository.findById(tagId);
    if (tag) {
      tag.incrementUsage();
      await this.tagRepository.update(tagId, tag);
    }
  }

  private async _decrementTagUsage(tagId: string): Promise<void> {
    const tag = await this.tagRepository.findById(tagId);
    if (tag) {
      tag.decrementUsage();
      await this.tagRepository.update(tagId, tag);
    }
  }

  private async _canDeleteTag(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    const usageCount = await this.tagRepository.countProductsByTag(id);
    if (usageCount > 0) {
      return {
        canDelete: false,
        reason: `Cannot delete tag that is used by ${usageCount} products`
      };
    }
    return { canDelete: true };
  }
}