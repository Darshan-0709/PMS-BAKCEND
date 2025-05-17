import { Request, Response, NextFunction } from "express";
import {
    placementCellUpdateSchema,
    placementCellIdSchema,
} from "../validators/placementCell.validator";
import {
    getPlacementCellById,
    updatePlacementCell,
    softDeletePlacementCell,
} from "../services/placementCell.service";
import { ResponseHandler } from "../utils/apiResponse";

export const getPlacementCellController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = placementCellIdSchema.parse(req.params);
        const placementCell = await getPlacementCellById(id);
        ResponseHandler.fetched(
            res,
            placementCell,
            "Placement cell fetched successfully"
        );
    } catch (error) {
        next(error);
    }
};

export const updatePlacementCellController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = placementCellIdSchema.parse(req.params);
        const validatedData = placementCellUpdateSchema.parse(req.body);
        const updatedPlacementCell = await updatePlacementCell(
            id,
            validatedData
        );
        ResponseHandler.success(
            res,
            updatedPlacementCell,
            "Placement cell updated successfully"
        );
    } catch (error) {
        next(error);
    }
};

export const deletePlacementCellController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = placementCellIdSchema.parse(req.params);
        await softDeletePlacementCell(id);
        ResponseHandler.success(
            res,
            null,
            "Placement cell deleted successfully"
        );
    } catch (error) {
        next(error);
    }
};

export const getStudentPlacementCellController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = placementCellIdSchema.parse(req.params);
        const placementCell = await getPlacementCellById(id);
        ResponseHandler.fetched(
            res,
            placementCell,
            "Placement cell profile fetched successfully"
        );
    } catch (error) {
        next(error);
    }
};
