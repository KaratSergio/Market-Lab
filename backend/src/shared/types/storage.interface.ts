export interface FileUploadDto {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface UploadOptions {
  folder: string;
  supplierId?: string;
  productId?: string;
  isPublic?: boolean;
}

export interface UploadResult {
  url: string;
  key: string;
  // size: number;
  // mimetype: string;
}

export interface FileStorage {
  upload(
    file: FileUploadDto,
    options: UploadOptions
  ): Promise<UploadResult>;

  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  listFiles(prefix: string): Promise<string[]>;
  deleteFolder(prefix: string): Promise<void>;
}

export interface ProductImageMetadata {
  type: 'main' | 'gallery';
  order?: number;
  alt?: string;
  uploadedAt: Date;
}

export interface UploadFileDto {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export interface ProductImageUrls {
  main: string | null;
  gallery: string[];
}

export interface SupplierDocuments {
  [documentType: string]: string[];
}