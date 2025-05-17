import { AppError } from "./AppError";
import { ErrorMessage } from "../constants/messages";
import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorCode } from "../constants/errorCodes";

export class NotFoundError extends AppError {
    statusCode = HttpStatus.NOT_FOUND;
    errors = {
        [ErrorCode.NOT_FOUND]: ErrorMessage.NOT_FOUND,
    };

    constructor(message = ErrorMessage.NOT_FOUND) {
        super(message);
    }
}
