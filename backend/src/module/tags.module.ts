import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagController } from '@controller/tags.controller';
import { TagService } from '@domain/tags/tag.service';
import { TagOrmEntity } from '@infrastructure/database/postgres/tags/tag.entity';
import { PostgresTagRepository } from '@infrastructure/database/postgres/tags/tag.repository';
import { TranslationsModule } from './translations.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([TagOrmEntity]),
    TranslationsModule,
  ],
  controllers: [TagController],
  providers: [
    TagService,
    {
      provide: 'TagRepository',
      useClass: PostgresTagRepository,
    },
  ],
  exports: [TagService, 'TagRepository'],
})
export class TagsModule { }