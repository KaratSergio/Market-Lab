// Use it to type the incoming data

export interface CreateProductDto{
    name: string;
    description: string;
    price: number; 
}

export interface UpdateProductDto extends Partial<CreateProductDto>{};