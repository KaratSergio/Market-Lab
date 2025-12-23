// a universal methods for interaction with DB (mongo, postgreSQL ...)

// Base CRUD
export interface BaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
}

// for Search
export interface QueryableRepository<T> {
  findOne(filter: Partial<T>): Promise<T | null>;
  findMany(filter: Partial<T>): Promise<T[]>;
  findAll(): Promise<T[]>;
}

// Utility
export interface UtilityRepository<T> {
  exists(id: string): Promise<boolean>;
}

// Pagination (optional)
export interface PaginableRepository<T> {
  findWithPagination(
    page: number,
    limit: number,
    filter?: Partial<T>
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}


export interface FullRepository<T> extends
  BaseRepository<T>,
  QueryableRepository<T>,
  UtilityRepository<T>,
  PaginableRepository<T> { }

export interface MinimalRepository<T> extends
  BaseRepository<T>,
  QueryableRepository<T> { }