import { Injectable, Inject } from '@nestjs/common';
import { TranslationRepository } from './translation.repository';
import { TranslationDomainEntity } from './translation.entity';

import {
  TranslationQueryDto,
  TranslationEntityType,
  LanguageCode,
  TranslationCreateData
} from './types';


@Injectable()
export class TranslationService {
  constructor(
    @Inject('TranslationRepository')
    private readonly translationRepository: TranslationRepository
  ) { }

  async getEntityTranslations(
    entityId: string,
    entityType: TranslationEntityType
  ): Promise<TranslationDomainEntity[]> {
    return this.translationRepository.getTranslationsForEntity(entityId, entityType);
  }

  async getTranslationsForEntities(
    entityIds: string[],
    entityType: TranslationEntityType,
    languageCode?: LanguageCode
  ): Promise<TranslationDomainEntity[]> {
    return this.translationRepository.getTranslationsForEntities(
      entityIds,
      entityType,
      languageCode
    );
  }

  async saveTranslations(
    entityId: string,
    entityType: TranslationEntityType,
    translations: Record<LanguageCode, Record<string, string>>
  ): Promise<void> {
    await this.translationRepository.deleteByEntity(entityId, entityType);
    const translationEntities: TranslationCreateData[] = [];

    for (const [languageCode, fields] of Object.entries(translations)) {
      for (const [fieldName, translationText] of Object.entries(fields)) {
        if (translationText?.trim()) {
          const translation = TranslationDomainEntity.create({
            entityId,
            entityType,
            languageCode: languageCode as LanguageCode,
            fieldName,
            translationText
          });

          if (translation.validate().length === 0) {
            translationEntities.push({
              entityId,
              entityType,
              languageCode: languageCode as LanguageCode,
              fieldName,
              translationText
            });
          }
        }
      }
    }

    if (translationEntities.length > 0) {
      await this.translationRepository.bulkCreate(translationEntities);
    }
  }

  async deleteTranslations(
    entityId: string,
    entityType: TranslationEntityType,
    languageCode?: LanguageCode,
    fieldName?: string
  ): Promise<void> {
    await this.translationRepository.deleteByEntity(
      entityId,
      entityType,
      languageCode,
      fieldName
    );
  }

  async searchTranslations(query: TranslationQueryDto): Promise<TranslationDomainEntity[]> {
    return this.translationRepository.findByQuery(query);
  }
}