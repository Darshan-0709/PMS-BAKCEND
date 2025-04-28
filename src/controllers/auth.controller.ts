import { NextFunction, Request, Response } from "express";
import {
  registerValidationSchema,
  userValidationSchema,
} from "../validators/auth.validator";
import { ResponseHandler } from "../utils/response";
import {
  registerUser,
  validateUsernameAndEmail,
} from "../services/auth.service";
import { ApiResponse } from "../types/response.type";
import { SUCCESS } from "../constants/success";

export const validateUserInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = userValidationSchema.parse(req.body);
    const { username, email } = data;

    await validateUsernameAndEmail(username, email);

    ResponseHandler.success(res, {
      message: "Validation successful. You can proceed to register.",
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = registerValidationSchema.parse(req.body);

    const result = await registerUser(validatedData);

    ResponseHandler.created(res, result, SUCCESS.USER_REGISTERED.message);
  } catch (error) {
    next(error);
  }
};
