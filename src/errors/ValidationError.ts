import { AppError } from "./AppError";
import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorMessage } from "../constants/messages";

export class ValidationError extends AppError {
    statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    errors: Record<string, string>;

    constructor(errors: Record<string, string>) {
        super(ErrorMessage.VALIDATION_ERROR);
        this.errors = errors;
    }
}
