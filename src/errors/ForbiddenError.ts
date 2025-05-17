import { AppError } from "./AppError";
import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorMessage } from "../constants/messages";
import { ErrorCode } from "../constants/errorCodes";

export class ForbiddenError extends AppError {
    readonly statusCode = HttpStatus.FORBIDDEN;
    readonly errors = {
        [ErrorCode.FORBIDDEN]: ErrorMessage.FORBIDDEN,
    };

    constructor(message: string = ErrorMessage.FORBIDDEN) {
        super(message)
    }
}
