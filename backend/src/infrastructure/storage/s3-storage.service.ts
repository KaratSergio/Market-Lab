import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

import { Injectable, Logger } from '@nestjs/common';
import { S3Config } from './s3.config';

export interface UploadFileDto {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export interface UploadResult {
  url: string;
  key: string;
}

export interface ProductImageUrls {
  main: string | null;
  gallery: string[];
}

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private s3Client: S3Client;

  constructor(private s3Config: S3Config) {
    this.s3Client = new S3Client({
      region: this.s3Config.region,
      endpoint: this.s3Config.endpoint,
      credentials: {
        accessKeyId: this.s3Config.accessKey,
        secretAccessKey: this.s3Config.secretKey,
      },
    });
  }

  private get bucket(): string {
    return this.s3Config.bucket;
  }

  private get publicUrl(): string {
    return this.s3Config.publicUrl;
  }

  /**
   * Generates a path to S3 based on data from the database
   */
  private buildPath(
    supplierCompanyName: string,
    productName: string,
    fileName: string,
    isMain: boolean = false
  ): string {
    // Clearing names of special characters
    const cleanSupplierName = supplierCompanyName
      .replace(/[^a-zA-Z0-9а-яА-Я\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    const cleanProductName = productName
      .replace(/[^a-zA-Z0-9а-яА-Я\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = isMain ? 'main' : 'gallery';

    return `suppliers/${cleanSupplierName}/${cleanProductName}/${folder}/${timestamp}_${sanitizedFileName}`;
  }

  /**
   * Loads product image
   */
  async uploadProductImage(
    file: UploadFileDto,
    supplierCompanyName: string,
    productName: string,
    isMain: boolean = false
  ): Promise<UploadResult> {
    const key = this.buildPath(supplierCompanyName, productName, file.originalname, isMain);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        supplierCompanyName,
        productName,
        isMain: isMain.toString(),
        uploadedAt: new Date().toISOString(),
      },
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`Product image uploaded: ${key}`);

      return {
        url: `${this.publicUrl}/${key}`,
        key,
      };
    } catch (error) {
      this.logger.error(`Failed to upload product image: ${error.message}`);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Uploads multiple product images
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
   * Removes all product images
   */
  async deleteProductImages(
    supplierCompanyName: string,
    productName: string
  ): Promise<void> {
    const prefix = `suppliers/${supplierCompanyName}/${productName}/`;

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);
      const files = response.Contents?.map(item => item.Key || '') || [];

      // delete all product files
      for (const fileKey of files) {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: fileKey,
          })
        );
      }

      this.logger.log(`Deleted ${files.length} files for product: ${productName}`);
    } catch (error) {
      this.logger.error(`Failed to delete product images: ${error.message}`);
    }
  }

  /**
   * Gets the URLs of all product images
   */
  async getProductImageUrls(
    supplierCompanyName: string,
    productName: string
  ): Promise<ProductImageUrls> {
    const prefix = `suppliers/${supplierCompanyName}/${productName}/`;

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);
      const files = response.Contents?.map(item => item.Key || '') || [];

      const mainImage = files.find(f => f.includes('/main/'));
      const galleryImages = files.filter(f => f.includes('/gallery/'));

      return {
        main: mainImage ? `${this.publicUrl}/${mainImage}` : null,
        gallery: galleryImages.map(f => `${this.publicUrl}/${f}`),
      };
    } catch (error) {
      this.logger.error(`Failed to list product images: ${error.message}`);
      return { main: null, gallery: [] };
    }
  }

  /**
   * Loads the supplier's logo
  */
  async uploadSupplierLogo(
    file: UploadFileDto,
    supplierCompanyName: string
  ): Promise<UploadResult> {
    const cleanName = supplierCompanyName
      .replace(/[^a-zA-Z0-9а-яА-Я\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `suppliers/${cleanName}/logo/${timestamp}_${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        supplierCompanyName,
        uploadedAt: new Date().toISOString(),
      },
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`Supplier logo uploaded: ${key}`);

      return {
        url: `${this.publicUrl}/${key}`,
        key,
      };
    } catch (error) {
      this.logger.error(`Failed to upload supplier logo: ${error.message}`);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Removes the supplier logo
  */
  async deleteSupplierLogo(supplierCompanyName: string): Promise<void> {
    const cleanName = supplierCompanyName
      .replace(/[^a-zA-Z0-9а-яА-Я\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    const prefix = `suppliers/${cleanName}/logo/`;
    const files = await this.listFiles(prefix);

    for (const file of files) {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: file,
        })
      );
    }
  }

  /**
   * Uploads supplier document
   */
  async uploadSupplierDocument(
    file: UploadFileDto,
    supplierCompanyName: string,
    documentType: string
  ): Promise<UploadResult> {
    const cleanName = supplierCompanyName
      .replace(/[^a-zA-Z0-9а-яА-Я\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `suppliers/${cleanName}/documents/${documentType}/${timestamp}_${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        supplierCompanyName,
        documentType,
        uploadedAt: new Date().toISOString(),
      },
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`Supplier document uploaded: ${key}`);

      return {
        url: `${this.publicUrl}/${key}`,
        key,
      };
    } catch (error) {
      this.logger.error(`Failed to upload supplier document: ${error.message}`);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Uploads multiple supplier documents
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
   * Gets all supplier documents URLs
   */
  async getSupplierDocumentUrls(supplierCompanyName: string): Promise<{ [key: string]: string[] }> {
    const cleanName = supplierCompanyName
      .replace(/[^a-zA-Z0-9а-яА-Я\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    const prefix = `suppliers/${cleanName}/documents/`;

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);
      const files = response.Contents?.map(item => ({
        key: item.Key || '',
        url: `${this.publicUrl}/${item.Key}`
      })) || [];

      const documentsByType: { [key: string]: string[] } = {};

      files.forEach(file => {
        const parts = file.key.split('/');
        if (parts.length >= 4) {
          const type = parts[3]; // suppliers/{cleanName}/documents/{type}/{file}
          if (!documentsByType[type]) {
            documentsByType[type] = [];
          }
          documentsByType[type].push(file.url);
        }
      });

      return documentsByType;
    } catch (error) {
      this.logger.error(`Failed to list supplier documents: ${error.message}`);
      return {};
    }
  }

  /**
   * Deletes specific supplier document
   */
  async deleteSupplierDocument(
    supplierCompanyName: string,
    documentKey: string
  ): Promise<void> {
    const cleanName = supplierCompanyName
      .replace(/[^a-zA-Z0-9а-яА-Я\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

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
   * Deletes all supplier documents
   */
  async deleteAllSupplierDocuments(supplierCompanyName: string): Promise<void> {
    const cleanName = supplierCompanyName
      .replace(/[^a-zA-Z0-9а-яА-Я\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    const prefix = `suppliers/${cleanName}/documents/`;
    const files = await this.listFiles(prefix);

    for (const file of files) {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: file,
        })
      );
    }
    this.logger.log(`Deleted all documents for supplier: ${supplierCompanyName}`);
  }

  // Helper method for getting a list of files
  private async listFiles(prefix: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);
      return response.Contents?.map(item => item.Key || '') || [];
    } catch (error) {
      return [];
    }
  }
}