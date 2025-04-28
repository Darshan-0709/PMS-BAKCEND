import { Request, Response, NextFunction } from "express";
import { ApiError, ValidationError } from "../utils/error";
import { ResponseHandler } from "../utils/response";
import { ErrorCode } from "../constants/errors";
import { object, z, ZodError, ZodIssueCode } from "zod";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle known API errors
  if (err instanceof ApiError) {
    ResponseHandler.error(res, err);
    return;
  }

  // Handle multer file errors
  if ((err as any)?.name === "MulterError") {
    const fileError = new ApiError(
      ErrorCode.FILE_TOO_LARGE,
      413,
      (err as Error).message
    );
    ResponseHandler.error(res, fileError);
    return;
  }

  if (err instanceof ZodError) {
    const formattedErrors = handleZodError(err, req.body);

    const validationError = new ValidationError(formattedErrors);
    ResponseHandler.error(res, validationError);
    return;
  }

  // Generic error handler
  const internalError = new ApiError(
    ErrorCode.INTERNAL_ERROR,
    500,
    process.env.NODE_ENV === "development" ? (err as Error).stack : undefined
  );

  ResponseHandler.error(res, internalError);
};

export function handleZodError(
  error: ZodError,
  reqBody: any
): Record<string, string> {
  const formatted: Record<string, string> = {};
  const role = reqBody?.role;

  const unionIssue = error.issues.find(
    (issue) => issue.code === ZodIssueCode.invalid_union
  );

  if (unionIssue && "unionErrors" in unionIssue) {
    const unionErrors = unionIssue.unionErrors as ZodError[];

    let profileFieldName: string | undefined;
    switch (role) {
      case "student":
        profileFieldName = "studentProfileData";
        break;
      case "placement_cell":
        profileFieldName = "placementCellProfileData";
        break;
      case "recruiter":
        profileFieldName = "recruiterProfileData";
        break;
    }

    if (profileFieldName) {
      const matchedBranch =
        unionErrors.find((branch) =>
          branch.issues.some((issue) => issue.path[0] === profileFieldName)
        ) ?? unionErrors[0];

      matchedBranch.issues.forEach((issue) => {
        if (issue.path[0] === profileFieldName) {
          const fullPath = [profileFieldName, ...issue.path.slice(1)].join(".");
          formatted[fullPath] = issue.message;
        } else if (issue.path[0] !== "role") {
          formatted[issue.path.join(".")] = issue.message;
        }
      });
    }
  } else {
    // Normal zod errors (non-union)
    error.issues.forEach((issue) => {
      formatted[issue.path.join(".")] = issue.message;
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.error("Validation failed with errors:", formatted);
  }

  return formatted;
}
