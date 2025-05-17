import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/apiResponse";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { ValidationError } from "../errors/ValidationError";
import { InternalServerError } from "../errors/InternalServerError";

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let finalError: AppError;
    console.error(err);
    if (err instanceof AppError) {
        finalError = err;
    } else if (err instanceof ZodError) {
        finalError = formatZodError(err);
    } else {
        finalError = new InternalServerError(err as Error);
    }
    ResponseHandler.error(res, finalError);
};

/**
 * Flattens ZodError into a key-message object.
 * For union schemas, only the leaf field name is retained.
 */
export function formatZodError(error: ZodError): ValidationError {
  const issues = error.issues;

  const formatted: Record<string, string> = {};

  for (const issue of issues) {
    const path = issue.path;

    if (path.length === 0) continue; // Skip global errors

    // Get only the leaf field name (e.g., "enrollmentNumber" instead of "studentProfileData.enrollmentNumber")
    const key = path[path.length - 1]?.toString();

    if (!formatted[key]) {
      formatted[key] = issue.message;
    }
  }

  return new ValidationError(formatted);
}
