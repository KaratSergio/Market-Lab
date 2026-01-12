export interface DocumentStorage {
  upload(file: Express.Multer.File, companyName: string): Promise<string>;
  uploadMany(files: Express.Multer.File[], companyName: string): Promise<string[]>;
  delete(fileUrl: string, companyName: string): Promise<void>;
  getAll(companyName: string): Promise<string[]>;
}