export interface ApiResponse<T> {
  success: boolean;
  message?: string;  
  data?: T;
  error?: ApiError;
  pagination?: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}