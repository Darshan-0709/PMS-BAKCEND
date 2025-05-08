import { AppError } from "./AppError";
import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorMessage } from "../constants/messages";

export class BadRequestError extends AppError {
    statusCode = HttpStatus.BAD_REQUEST;
    errors?: Record<string, string>;

    constructor(message: string = ErrorMessage.BAD_REQUEST) {
        super(message);
        this.errors = {
            message,
        };
    }
}
