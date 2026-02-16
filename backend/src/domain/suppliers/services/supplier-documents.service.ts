import { Injectable, Inject } from '@nestjs/common';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SupplierRepository } from '../supplier.repository';

@Injectable()
export class SupplierDocumentsService {
  constructor(
    @Inject('SupplierRepository')
    private readonly supplierRepository: SupplierRepository,
  ) { }

  async uploadDocuments(
    id: string,
    files: Express.Multer.File[],
    userId: string,
    userRoles: string[]
  ): Promise<{ urls: string[] }> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    if (supplier.userId !== userId && !userRoles.includes('admin')) {
      throw new ForbiddenException('You can only upload documents for your own supplier profile');
    }

    const uploadedUrls = files.map(file => `/uploads/documents/${file.filename}`);
    const updatedDocuments = [...supplier.documents, ...uploadedUrls];

    await this.supplierRepository.update(id, { documents: updatedDocuments });

    return { urls: uploadedUrls };
  }

  async getDocuments(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<string[]> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    if (supplier.userId !== userId && !userRoles.includes('admin')) {
      throw new ForbiddenException('You can only view documents for your own supplier profile');
    }

    return supplier.documents;
  }

  async deleteDocument(
    id: string,
    documentUrl: string,
    userId: string,
    userRoles: string[]
  ): Promise<void> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    if (supplier.userId !== userId && !userRoles.includes('admin')) {
      throw new ForbiddenException('You can only delete documents from your own supplier profile');
    }

    const updatedDocuments = supplier.documents.filter(doc => doc !== documentUrl);
    await this.supplierRepository.update(id, { documents: updatedDocuments });
  }
}