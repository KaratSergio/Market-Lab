// a universal interface for all domain entities

export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}