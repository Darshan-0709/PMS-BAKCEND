import { HttpStatus } from "../constants/httpStatusCodes";
import { AppError } from "./AppError";
import { ErrorMessage } from "../constants/messages";
import { ErrorCode } from "../constants/errorCodes";

export class InternalServerError extends AppError {
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    errors?: Record<string, string> | undefined;
    
    constructor(private error: Error) {
        super(ErrorMessage.INTERNAL_ERROR);
        if (process.env.NODE_ENV === "development") {
            this.errors = {
                [ErrorCode.INTERNAL_ERROR]: this.error.stack || "No stack available",
            };
        } else {
            this.errors = {
                [ErrorCode.INTERNAL_ERROR]: ErrorMessage.INTERNAL_ERROR,
            };
        }
    }
}
