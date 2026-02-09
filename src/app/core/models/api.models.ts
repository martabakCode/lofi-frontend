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

export function toPaginatedResponse<T>(response: any): { items: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  if (!response) {
    return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
  }

  // Handle direct array
  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length,
      page: 1,
      pageSize: response.length,
      totalPages: 1
    };
  }

  // Handle nested data field if passed the whole response by accident
  const actualData = response.data || response;

  // Extract items from common keys
  const items = actualData.items || actualData.content || (Array.isArray(actualData) ? actualData : []);
  const meta = actualData.meta;

  return {
    items,
    total: meta?.totalItems ?? actualData.totalElements ?? actualData.total ?? items.length,
    page: (meta?.page !== undefined ? meta.page + 1 : (actualData.number !== undefined ? actualData.number + 1 : 1)),
    pageSize: meta?.size ?? actualData.size ?? 10,
    totalPages: meta?.totalPages ?? actualData.totalPages ?? 1
  };
}
