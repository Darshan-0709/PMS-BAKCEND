import { Request, Response, NextFunction } from "express";
import { recruiterUpdateSchema } from "../validators/recruiter.validator";
import {
    getRecruiterById,
    updateRecruiter,
    deleteRecruiter,
} from "../services/recruiter.service";
import { ResponseHandler } from "../utils/apiResponse";

export const getRecruiterController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        console.log({ id });
        console.log({ id });
        console.log({ id });
        const recruiter = await getRecruiterById(id);
        ResponseHandler.fetched(
            res,
            recruiter,
            "Recruiter fetched successfully"
        );
    } catch (error) {
        next(error);
    }
};

export const updateRecruiterController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const validatedData = recruiterUpdateSchema.parse(req.body);
        const recruiter = await updateRecruiter(id, validatedData);
        ResponseHandler.success(
            res,
            recruiter,
            "Recruiter updated successfully"
        );
    } catch (error) {
        next(error);
    }
};

export const deleteRecruiterController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        await deleteRecruiter(id);
        ResponseHandler.success(res, null, "Recruiter deleted successfully");
    } catch (error) {
        next(error);
    }
};
