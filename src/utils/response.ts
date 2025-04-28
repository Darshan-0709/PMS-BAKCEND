import { Response } from 'express';
import { ApiResponse, Pagination } from '../types/response.type';
import { ApiError } from './error';

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    pagination?: Pagination
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };

    if (pagination) {
      response.pagination = pagination;
    }

    return res.status(200).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message?: string
  ): Response<ApiResponse<T>> {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    error: ApiError
  ): Response<ApiResponse<null>> {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }
}

// Pagination helper
export const calculatePagination = (
  total: number,
  page: number,
  pageSize: number
): Pagination => ({
  total,
  page,
  pageSize,
  totalPages: Math.ceil(total / pageSize),
});
