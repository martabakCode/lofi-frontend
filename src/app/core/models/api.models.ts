export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items?: T[];
  content?: T[];
  meta?: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
  };
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}
