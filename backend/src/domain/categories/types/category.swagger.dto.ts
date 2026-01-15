import {
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';

import {
  IsString, IsNumber,
  IsOptional, IsArray, Min,
  IsUrl, IsObject
} from 'class-validator';
import { Type } from 'class-transformer';


export class CategoryResponseDtoSwagger {
  @ApiProperty({
    description: 'List of categories',
    example: ['electronics', 'clothing', 'books', 'home', 'sports'],
    type: [String],
  })
  categories: string[];

  @ApiProperty({
    description: 'Category with product count',
    example: [
      { name: 'electronics', count: 150 },
      { name: 'clothing', count: 200 },
      { name: 'books', count: 100 }
    ],
  })
  categoriesWithCount: Array<{ name: string; count: number }>;
}