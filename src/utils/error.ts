import { ErrorCode, ErrorMessage } from "../constants/errors";

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    public details?: unknown
  ) {
    super(ErrorMessage[code]);
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

// Specific error classes for common cases
export class NotFoundError extends ApiError {
  constructor(details?: unknown) {
    super(ErrorCode.NOT_FOUND, 404, details);
  }
}

export class ValidationError extends ApiError {
  constructor(details?: unknown) {
    super(ErrorCode.VALIDATION_ERROR, 400, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super(ErrorCode.UNAUTHORIZED, 401);
  }
}
