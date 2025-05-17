import { NextFunction, Request, Response } from "express";
import {
    registerValidationSchema,
    userValidationSchema,
} from "../validators/auth.validator";
import { ResponseHandler } from "../utils/apiResponse";
import {
    registerUser,
    validateUserData,
    login,
} from "../services/auth.service";
import { SuccessMessage } from "../constants/messages";

export const validateUserInput = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = userValidationSchema.parse(req.body);
        const { username, email, password, confirmPassword} = data;

        await validateUserData(username, email, password, confirmPassword);

        ResponseHandler.fetched(res, SuccessMessage.VALIDATION_SUCCESSFUL);
    } catch (error) {
        next(error);
    }
};

export const registerController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedData = registerValidationSchema.parse(req.body);
        const result = await registerUser(validatedData);
        ResponseHandler.created(res, result, SuccessMessage.USER_REGISTERED);
    } catch (error) {
        next(error);
    }
};

export const loginController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;
        await login(email, password, res);
    } catch (err) {
        next(err);
    }
};
