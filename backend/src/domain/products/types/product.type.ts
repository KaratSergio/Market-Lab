// Use only within the domain, internal typing..
import { Entity } from "@shared/types/entity.interface";

export interface ProductModel extends Entity {
  name: string;
  description: string;
  price: number;
}