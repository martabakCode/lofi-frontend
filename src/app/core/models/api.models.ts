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

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
}

export function toPaginatedResponse<T>(response: PaginatedResponse<T>): { items: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const items = response.items || response.content || [];
  const meta = response.meta;

  return {
    items,
    total: meta?.totalItems ?? response.totalElements ?? items.length,
    page: meta?.page ?? (response.number !== undefined ? response.number + 1 : 1),
    pageSize: meta?.size ?? response.size ?? items.length,
    totalPages: meta?.totalPages ?? response.totalPages ?? 1
  };
}
