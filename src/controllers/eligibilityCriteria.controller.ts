/// <reference path="../../@types/express/index.d.ts" />
import { Request, Response, NextFunction } from "express";
import {
    eligibilityCriteriaIdSchema,
    eligibilityCriteriaSchema,
    eligibilityCriteriaUpdateSchema,
} from "../validators/eligibilityCriteria.validator";
import {
    createEligibilityCriteria,
    getEligibilityCriteriaById,
    getAllEligibilityCriteriaForRecruiter,
    updateEligibilityCriteria,
    softDeleteEligibilityCriteria,
} from "../services/eligibilityCriteria.service";
import { ResponseHandler } from "../utils/apiResponse";

export const createEligibilityCriteriaController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedData = eligibilityCriteriaSchema.parse(req.body);
        const criteria = await createEligibilityCriteria(
            validatedData,
            req.user!.userId
        );
        ResponseHandler.success(
            res,
            criteria,
            "Eligibility criteria created successfully"
        );
    } catch (error) {
        next(error);
    }
};

export const getEligibilityCriteriaController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = eligibilityCriteriaIdSchema.parse(req.params);
        const criteria = await getEligibilityCriteriaById(id);
        ResponseHandler.fetched(
            res,
            criteria,
            "Eligibility criteria fetched successfully"
        );
    } catch (error) {
        next(error);
    }
};

export const getAllEligibilityCriteriaController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const criteriaList = await getAllEligibilityCriteriaForRecruiter(
            req.user!.userId
        );
        ResponseHandler.fetched(
            res,
            criteriaList,
            "Eligibility criteria fetched successfully"
        );
    } catch (error) {
        next(error);
    }
};

export const updateEligibilityCriteriaController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = eligibilityCriteriaIdSchema.parse(req.params);
        const validatedData = eligibilityCriteriaUpdateSchema.parse(req.body);
        const updatedCriteria = await updateEligibilityCriteria(
            id,
            validatedData
        );
        ResponseHandler.success(
            res,
            updatedCriteria,
            "Eligibility criteria updated successfully"
        );
    } catch (error) {
        next(error);
    }
};

export const deleteEligibilityCriteriaController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = eligibilityCriteriaIdSchema.parse(req.params);
        await softDeleteEligibilityCriteria(id);
        ResponseHandler.success(
            res,
            null,
            "Eligibility criteria deleted successfully"
        );
    } catch (error) {
        next(error);
    }
};
