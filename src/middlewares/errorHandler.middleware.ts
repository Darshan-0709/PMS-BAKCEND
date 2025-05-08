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
        const formattedErrors = handleZodError(err);
        finalError = new ValidationError(formattedErrors);
    } else {
        finalError = new InternalServerError(err as Error);
    }

    ResponseHandler.error(res, finalError);
};

export function handleZodError(error: ZodError): Record<string, string> {
    const formatted: Record<string, string> = {};

    error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        formatted[path] = issue.message;
    });

    if (process.env.NODE_ENV === "development") {
        console.error("Validation failed with errors:", formatted);
    }

    return formatted;
}
