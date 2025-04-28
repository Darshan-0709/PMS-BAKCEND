export enum ErrorCode {
  // General Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Auth Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // File Errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
}

export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed',
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials',
  [ErrorCode.FILE_TOO_LARGE]: 'File size exceeds limit',
  [ErrorCode.INVALID_FILE_TYPE]: 'Invalid file type',
  [ErrorCode.TOO_MANY_REQUESTS]: 'Too many requests from this IP',
};

export type ErrorPayload = {
  code: ErrorCode;
  details?: unknown;
  message?: string;
};