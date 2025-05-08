import { AppError } from "./AppError";
import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorMessage } from "../constants/messages";

export class ForbiddenError extends AppError {
    statusCode = HttpStatus.FORBIDDEN;
    errors?: Record<string, string>;

    constructor(message: string = ErrorMessage.FORBIDDEN) {
        super(message);
        this.errors = {
            message,
        };
    }
}
