import { ErrorCode } from "./errorCodes";
import { SuccessCode } from "./successCodes";

export const SuccessMessage: Record<SuccessCode, string> = {
    [SuccessCode.USER_REGISTERED]: "User registered successfully.",
    [SuccessCode.LOGIN_SUCCESS]: "Login successful.",
    [SuccessCode.DATA_FETCHED]: "Data fetched successfully.",
    [SuccessCode.CREATED]: "Resource created successfully.",
    [SuccessCode.UPDATED]: "Resource updated successfully.",
    [SuccessCode.DELETED]: "Resource deleted successfully.",
    [SuccessCode.VALIDATION_SUCCESSFUL]: "Validation was successful.",
};

export const ErrorMessage: Record<ErrorCode, string> = {
    [ErrorCode.INTERNAL_ERROR]: "Internal server error",
    [ErrorCode.VALIDATION_ERROR]: "Validation failed",
    [ErrorCode.NOT_FOUND]: "Resource not found",
    [ErrorCode.UNAUTHORIZED]: "Unauthorized access",
    [ErrorCode.FORBIDDEN]:
        "You do not have permission to access this resource.",
    [ErrorCode.INVALID_CREDENTIALS]: "Invalid credentials",
    [ErrorCode.FILE_TOO_LARGE]: "File size exceeds limit",
    [ErrorCode.INVALID_FILE_TYPE]: "Invalid file type",
    [ErrorCode.TOO_MANY_REQUESTS]: "Too many requests from this IP",
    [ErrorCode.TOKEN_MISSING]: "Access token is missing or invalid.",
    [ErrorCode.BAD_REQUEST]: "Bad request",
};
