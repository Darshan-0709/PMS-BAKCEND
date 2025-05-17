import { AppError } from "./AppError";
import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorMessage } from "../constants/messages";
import { ErrorCode } from "../constants/errorCodes";

export class UnauthorizedError extends AppError {
    readonly statusCode = HttpStatus.UNAUTHORIZED;
    readonly errors = {
        [ErrorCode.TOKEN_MISSING]: ErrorMessage.TOKEN_MISSING,
    };

    constructor(message = ErrorMessage.TOKEN_MISSING) {
        super(message);
    }
}
