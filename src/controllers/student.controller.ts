import { Request, Response, NextFunction } from "express";
import {
    studentUpdateSchema,
    studentBatchVerifySchema,
    studentIdSchema,
} from "../validators/student.validator";
import {
    getStudentById,
    getStudentsByPlacementCell,
    updateStudent,
    softDeleteStudent,
    batchVerifyStudents,
} from "../services/student.service";
import { ResponseHandler } from "../utils/apiResponse";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ErrorMessage } from "../constants/messages";
import { PlacementCellContext } from "../auth/userContext";

export const getStudentController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = studentIdSchema.parse(req.params);
        const student = await getStudentById(id);
        ResponseHandler.fetched(res, student, "Student fetched successfully");
    } catch (error) {
        next(error);
    }
};

export const getStudentsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.user?.role !== "placement_cell") {
            throw new UnauthorizedError(ErrorMessage.UNAUTHORIZED);
        }
        const placementCellUser = req.user;
        const placementCellId = placementCellUser.placementCellId; // Safe to access after narrowing
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = 10;

        const { students, total } = await getStudentsByPlacementCell(
            placementCellId,
            page,
            pageSize
        );

        ResponseHandler.fetched(
            res,
            students,
            "Students fetched successfully",
            {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            }
        );
    } catch (error) {
        next(error);
    }
};

export const updateStudentController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        console.log("updateStudent")
        const { id } = studentIdSchema.parse(req.params);
        const validatedData = studentUpdateSchema.parse(req.body);
        const student = await updateStudent(id, validatedData);
        ResponseHandler.success(res, student, "Student updated successfully");
    } catch (error) {
        next(error);
    }
};

export const deleteStudentController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = studentIdSchema.parse(req.params);
        await softDeleteStudent(id);
        ResponseHandler.success(res, null, "Student deleted successfully");
    } catch (error) {
        next(error);
    }
};

export const batchVerifyStudentsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { studentIds, isVerifiedByPlacementCell } =
            studentBatchVerifySchema.parse(req.body);
        const result = await batchVerifyStudents(
            studentIds,
            isVerifiedByPlacementCell
        );
        ResponseHandler.success(
            res,
            result,
            "Students' verification status updated successfully"
        );
    } catch (error) {
        next(error);
    }
};
