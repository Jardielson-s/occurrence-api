export interface IRepository<T> {
  save: (data: T) => Promise<T>;
  findById: (id: string) => Promise<T | null>;
  find: (query?: object) => Promise<Array<T> | []>;
  findOne: (query?: object) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
}
