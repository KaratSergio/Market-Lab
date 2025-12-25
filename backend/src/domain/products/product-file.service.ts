import { Injectable, BadRequestException } from '@nestjs/common';
import { S3StorageService } from '@infrastructure/storage/s3-storage.service';

@Injectable()
export class ProductFileService {
  constructor(private readonly s3Service: S3StorageService) { }

  // Loads product images
  async uploadProductImages(
    files: Express.Multer.File[],
    supplierCompanyName: string,
    productName: string
  ): Promise<string[]> {
    this.validateImages(files);

    const uploadDtos = files.map(file => ({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    }));

    const results = await this.s3Service.uploadProductImages(
      uploadDtos,
      supplierCompanyName,
      productName
    );

    return results.map(result => result.url);
  }

  // Loads supplier logo
  async uploadSupplierLogo(
    file: Express.Multer.File,
    supplierCompanyName: string
  ): Promise<string> {
    this.validateImage(file);

    const uploadDto = {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    };

    const result = await this.s3Service.uploadSupplierLogo(
      uploadDto,
      supplierCompanyName
    );

    return result.url;
  }

  // Removes all product images
  async deleteProductImages(
    supplierCompanyName: string,
    productName: string
  ): Promise<void> {
    await this.s3Service.deleteProductImages(supplierCompanyName, productName);
  }

  // Image validation
  private validateImage(file: Express.Multer.File): void {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`
      );
    }

    if (file.size > maxSize) throw new BadRequestException('File size exceeds 5MB limit');
  }

  // Validating multiple images
  private validateImages(files: Express.Multer.File[]): void {
    const maxFiles = 10;

    if (files.length > maxFiles) throw new BadRequestException(`Maximum ${maxFiles} files allowed`);

    files.forEach(file => this.validateImage(file));
  }
}