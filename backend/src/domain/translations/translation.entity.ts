import {
  TranslationModel, LanguageCode,
  TranslationEntityType, CreateTranslationDto
} from './types';


export class TranslationDomainEntity implements TranslationModel {
  constructor(
    public id: string,
    public entityId: string,
    public entityType: TranslationEntityType,
    public languageCode: LanguageCode,
    public fieldName: string,
    public translationText: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }

  static create(dto: CreateTranslationDto): TranslationDomainEntity {
    return new TranslationDomainEntity(
      crypto.randomUUID(),
      dto.entityId,
      dto.entityType,
      dto.languageCode,
      dto.fieldName,
      dto.translationText
    );
  }

  update(translationText: string): void {
    this.translationText = translationText;
    this.updatedAt = new Date();
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.entityId) errors.push('Entity ID is required');
    if (!this.entityType) errors.push('Entity type is required');
    if (!this.languageCode) errors.push('Language code is required');
    if (!this.fieldName?.trim()) errors.push('Field name is required');
    if (!this.translationText?.trim()) errors.push('Translation text is required');

    return errors;
  }

  isForEntity(entityId: string, entityType: TranslationEntityType): boolean {
    return this.entityId === entityId && this.entityType === entityType;
  }
}