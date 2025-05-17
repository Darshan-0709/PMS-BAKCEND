import { AppError } from "./AppError";
import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorMessage } from "../constants/messages";
import { ErrorCode } from "../constants/errorCodes";

export class BadRequestError extends AppError {
    statusCode = HttpStatus.BAD_REQUEST;
    errors = {
        [ErrorCode.BAD_REQUEST]: ErrorMessage.BAD_REQUEST,
    };

    constructor(message: string = ErrorMessage.BAD_REQUEST) {
        super(message);
    }
}
