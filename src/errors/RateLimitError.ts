import { ErrorCode } from "../constants/errorCodes";
import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorMessage } from "../constants/messages";
import { AppError } from "./AppError";

export class RateLimitError extends AppError {
    statusCode = HttpStatus.TOO_MANY_REQUESTS;
    errors = {
        [ErrorCode.TOO_MANY_REQUESTS]: ErrorMessage.TOO_MANY_REQUESTS,
    };

    constructor(message = ErrorMessage.TOO_MANY_REQUESTS) {
        super(message);
    }
}
