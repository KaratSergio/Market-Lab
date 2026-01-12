import { Injectable } from '@nestjs/common';
import { DocumentStorage } from '@domain/suppliers/types';
import { S3StorageService } from './s3-storage.service';


@Injectable()
export class S3DocumentStorageAdapter implements DocumentStorage {
  constructor(private readonly s3StorageService: S3StorageService) { }

  async upload(file: Express.Multer.File, companyName: string): Promise<string> {
    const result = await this.s3StorageService.uploadSupplierDocument(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      },
      companyName,
      'general'
    );
    return result.url;
  }

  async uploadMany(files: Express.Multer.File[], companyName: string): Promise<string[]> {
    const uploadResults = await this.s3StorageService.uploadSupplierDocuments(
      files.map(file => ({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      })),
      companyName,
      'general'
    );
    return uploadResults.map(result => result.url);
  }

  async delete(fileUrl: string): Promise<void> {
    // Extract path without leading slash
    const documentKey = new URL(fileUrl).pathname.slice(1);
    await this.s3StorageService.deleteSupplierDocument(documentKey);
  }

  async getAll(companyName: string): Promise<string[]> {
    const documentsByType = await this.s3StorageService.getSupplierDocumentUrls(companyName);
    const allDocuments: string[] = [];
    Object.values(documentsByType).forEach(urls => {
      allDocuments.push(...urls);
    });
    return allDocuments;
  }
}