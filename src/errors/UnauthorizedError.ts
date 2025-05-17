import { AppError } from "./AppError";
import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorMessage } from "../constants/messages";
import { ErrorCode } from "../constants/errorCodes";

export class UnauthorizedError extends AppError {
    readonly statusCode = HttpStatus.UNAUTHORIZED;
    readonly errors = {
        [ErrorCode.UNAUTHORIZED]: ErrorMessage.UNAUTHORIZED,
    };

    constructor(message = ErrorMessage.UNAUTHORIZED) {
        super(message);
    }
}
