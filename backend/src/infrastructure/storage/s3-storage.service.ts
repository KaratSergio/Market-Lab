import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

import {
  UploadFileDto,
  UploadResult,
  ProductImageUrls,
  SupplierDocuments
} from '@shared/types';

import { Injectable, Logger } from '@nestjs/common';
import { S3Config } from './s3.config';


@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;

  constructor(private readonly s3Config: S3Config) {
    this.s3Client = new S3Client({
      region: this.s3Config.region,
      endpoint: this.s3Config.endpoint,
      credentials: {
        accessKeyId: this.s3Config.accessKey,
        secretAccessKey: this.s3Config.secretKey,
      },
    });
  }

  // ========== PUBLIC GETTERS ==========
  private get bucket(): string {
    return this.s3Config.bucket;
  }

  private get publicUrl(): string {
    return this.s3Config.publicUrl;
  }

  // ========== HELPER METHODS ==========
  /**
   * Sanitize string for use in S3 paths and metadata
   */
  private sanitizeString(text: string): string {
    return text
      .replace(/[^a-zA-Z0-9а-яА-Я\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  /**
   * Sanitize filename for S3
   */
  private sanitizeFileName(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  /**
   * Generate S3 key for supplier documents
   */
  private generateDocumentKey(
    supplierCompanyName: string,
    documentType: string,
    fileName: string
  ): string {
    const cleanName = this.sanitizeString(supplierCompanyName);
    const timestamp = Date.now();
    const sanitizedFileName = this.sanitizeFileName(fileName);

    return `suppliers/${cleanName}/documents/${timestamp}_${sanitizedFileName}`;
  }

  /**
   * Generate S3 key for supplier logo
   */
  private generateLogoKey(
    supplierCompanyName: string,
    fileName: string
  ): string {
    const cleanName = this.sanitizeString(supplierCompanyName);
    const timestamp = Date.now();
    const sanitizedFileName = this.sanitizeFileName(fileName);

    return `suppliers/${cleanName}/logo/${timestamp}_${sanitizedFileName}`;
  }

  /**
   * Generate S3 key for product images
   */
  private generateProductImageKey(
    supplierCompanyName: string,
    productName: string,
    fileName: string,
    isMain: boolean = false
  ): string {
    const cleanSupplierName = this.sanitizeString(supplierCompanyName);
    const cleanProductName = this.sanitizeString(productName);
    const timestamp = Date.now();
    const sanitizedFileName = this.sanitizeFileName(fileName);
    const folder = isMain ? 'main' : 'gallery';

    return `suppliers/${cleanSupplierName}/products/${cleanProductName}/${folder}/${timestamp}_${sanitizedFileName}`;
  }

  /**
   * Generic S3 upload method
   */
  private async uploadToS3(
    key: string,
    buffer: Buffer,
    mimetype: string,
    metadata: Record<string, string> = {}
  ): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      Metadata: metadata,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File uploaded to S3: ${key}`);

      return {
        url: `${this.publicUrl}/${key}`,
        key,
      };
    } catch (error) {
      this.logger.error(`S3 upload failed for key ${key}:`, error.message);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Generic method to list files by prefix
   */
  private async listFilesByPrefix(prefix: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);
      return response.Contents?.map(item => item.Key || '') || [];
    } catch (error) {
      this.logger.error(`Failed to list files with prefix ${prefix}:`, error.message);
      return [];
    }
  }

  /**
   * Generic method to delete files by prefix
   */
  private async deleteFilesByPrefix(prefix: string): Promise<void> {
    try {
      const files = await this.listFilesByPrefix(prefix);

      const deletePromises = files.map(fileKey =>
        this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: fileKey,
          })
        )
      );

      await Promise.all(deletePromises);
      this.logger.log(`Deleted ${files.length} files with prefix: ${prefix}`);
    } catch (error) {
      this.logger.error(`Failed to delete files with prefix ${prefix}:`, error.message);
    }
  }

  // ========== PRODUCT IMAGES ==========
  /**
   * Upload product image
   */
  async uploadProductImage(
    file: UploadFileDto,
    supplierCompanyName: string,
    productName: string,
    isMain: boolean = false
  ): Promise<UploadResult> {
    const key = this.generateProductImageKey(
      supplierCompanyName,
      productName,
      file.originalname,
      isMain
    );

    const metadata = {
      supplierCompanyName: this.sanitizeString(supplierCompanyName),
      productName: this.sanitizeString(productName),
      isMain: isMain.toString(),
      uploadedAt: new Date().toISOString(),
    };

    return this.uploadToS3(key, file.buffer, file.mimetype, metadata);
  }

  /**
   * Upload multiple product images
   */
  async uploadProductImages(
    files: UploadFileDto[],
    supplierCompanyName: string,
    productName: string
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadProductImage(file, supplierCompanyName, productName, index === 0)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Get product image URLs
   */
  async getProductImageUrls(
    supplierCompanyName: string,
    productName: string
  ): Promise<ProductImageUrls> {
    const cleanSupplierName = this.sanitizeString(supplierCompanyName);
    const cleanProductName = this.sanitizeString(productName);

    const prefix = `suppliers/${cleanSupplierName}/products/${cleanProductName}/`;
    const files = await this.listFilesByPrefix(prefix);

    const mainImage = files.find(f => f.includes('/main/'));
    const galleryImages = files.filter(f => f.includes('/gallery/'));

    return {
      main: mainImage ? `${this.publicUrl}/${mainImage}` : null,
      gallery: galleryImages.map(f => `${this.publicUrl}/${f}`),
    };
  }

  /**
   * Delete all product images
   */
  async deleteProductImages(
    supplierCompanyName: string,
    productName: string
  ): Promise<void> {
    const cleanSupplierName = this.sanitizeString(supplierCompanyName);
    const cleanProductName = this.sanitizeString(productName);

    const prefix = `suppliers/${cleanSupplierName}/products/${cleanProductName}/`;
    await this.deleteFilesByPrefix(prefix);
  }

  // ========== SUPPLIER LOGO ==========
  /**
   * Upload supplier logo
   */
  async uploadSupplierLogo(
    file: UploadFileDto,
    supplierCompanyName: string
  ): Promise<UploadResult> {
    const key = this.generateLogoKey(supplierCompanyName, file.originalname);

    const metadata = {
      supplierCompanyName: this.sanitizeString(supplierCompanyName),
      uploadedAt: new Date().toISOString(),
    };

    return this.uploadToS3(key, file.buffer, file.mimetype, metadata);
  }

  /**
   * Delete supplier logo
   */
  async deleteSupplierLogo(supplierCompanyName: string): Promise<void> {
    const cleanName = this.sanitizeString(supplierCompanyName);
    const prefix = `suppliers/${cleanName}/logo/`;
    await this.deleteFilesByPrefix(prefix);
  }

  // ========== SUPPLIER DOCUMENTS ==========
  /**
   * Upload supplier document
   */
  async uploadSupplierDocument(
    file: UploadFileDto,
    supplierCompanyName: string,
    documentType: string
  ): Promise<UploadResult> {
    const key = this.generateDocumentKey(supplierCompanyName, documentType, file.originalname);

    const metadata = {
      supplierCompanyName: this.sanitizeString(supplierCompanyName),
      documentType,
      uploadedAt: new Date().toISOString(),
    };

    return this.uploadToS3(key, file.buffer, file.mimetype, metadata);
  }

  /**
   * Upload multiple supplier documents
   */
  async uploadSupplierDocuments(
    files: UploadFileDto[],
    supplierCompanyName: string,
    documentType: string
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file =>
      this.uploadSupplierDocument(file, supplierCompanyName, documentType)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Get all supplier documents URLs
   */
  async getSupplierDocumentUrls(supplierCompanyName: string): Promise<SupplierDocuments> {
    const cleanName = this.sanitizeString(supplierCompanyName);
    const prefix = `suppliers/${cleanName}/documents/`;
    const files = await this.listFilesByPrefix(prefix);

    const documentsByType: SupplierDocuments = {};

    files.forEach(fileKey => {
      // Extract document type from metadata or filename if needed
      // For now, we'll group all documents under 'general'
      if (!documentsByType['general']) {
        documentsByType['general'] = [];
      }
      documentsByType['general'].push(`${this.publicUrl}/${fileKey}`);
    });

    return documentsByType;
  }

  /**
   * Delete specific supplier document
   */
  async deleteSupplierDocument(
    supplierCompanyName: string,
    documentKey: string
  ): Promise<void> {
    const cleanName = this.sanitizeString(supplierCompanyName);
    const fullKey = `suppliers/${cleanName}/documents/${documentKey}`;

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: fullKey,
        })
      );
      this.logger.log(`Supplier document deleted: ${fullKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete supplier document: ${error.message}`);
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  }

  /**
   * Delete all supplier documents
   */
  async deleteAllSupplierDocuments(supplierCompanyName: string): Promise<void> {
    const cleanName = this.sanitizeString(supplierCompanyName);
    const prefix = `suppliers/${cleanName}/documents/`;
    await this.deleteFilesByPrefix(prefix);
  }

  // ========== GENERIC METHODS ==========
  /**
   * Get all supplier files (for cleanup)
   */
  async getSupplierFiles(supplierCompanyName: string): Promise<string[]> {
    const cleanName = this.sanitizeString(supplierCompanyName);
    const prefix = `suppliers/${cleanName}/`;
    return this.listFilesByPrefix(prefix);
  }

  /**
   * Delete all supplier files (for account deletion)
   */
  async deleteAllSupplierFiles(supplierCompanyName: string): Promise<void> {
    const cleanName = this.sanitizeString(supplierCompanyName);
    const prefix = `suppliers/${cleanName}/`;
    await this.deleteFilesByPrefix(prefix);
  }

  /**
   * List all files for a supplier by category
   */
  async listSupplierFilesByCategory(
    supplierCompanyName: string,
    category: 'documents' | 'logo' | 'products'
  ): Promise<string[]> {
    const cleanName = this.sanitizeString(supplierCompanyName);
    const prefix = `suppliers/${cleanName}/${category}/`;
    return this.listFilesByPrefix(prefix);
  }
}