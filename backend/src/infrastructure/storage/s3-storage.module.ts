import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Config } from './s3.config';
import { S3StorageService } from './s3-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [S3Config, S3StorageService],
  exports: [S3StorageService, S3Config],
})
export class S3StorageModule { }