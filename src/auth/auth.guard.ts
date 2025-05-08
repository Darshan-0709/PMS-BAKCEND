import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import prisma from "../config/prisma";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ErrorMessage } from "../constants/messages";
import { UserContext } from "./userContext";

export const authGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            throw new UnauthorizedError(ErrorMessage.UNAUTHORIZED);
        }
        if (!process.env.TOKEN_KEY) {
            throw new Error("JWT secret key is not configured");
        }

        const decoded = verify(token, process.env.TOKEN_KEY) as {
            userId: string;
            email: string;
            role: string;
        };

        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId },
            include: {
                student: true,
                placementCell: true,
                recruiter: true,
            },
        });

        if (!user) {
            throw new UnauthorizedError(ErrorMessage.UNAUTHORIZED);
        }

        // Create user context based on role
        let userContext: UserContext;

        switch (user.role) {
            case "student":
                if (!user.student) {
                    throw new UnauthorizedError(ErrorMessage.UNAUTHORIZED);
                }
                userContext = {
                    userId: user.userId,
                    email: user.email,
                    role: "student",
                    studentId: user.student.studentId,
                };
                break;

            case "placement_cell":
                if (!user.placementCell) {
                    throw new UnauthorizedError(ErrorMessage.UNAUTHORIZED);
                }
                userContext = {
                    userId: user.userId,
                    email: user.email,
                    role: "placement_cell",
                    placementCellId: user.placementCell.placementCellId,
                };
                break;

            case "recruiter":
                if (!user.recruiter) {
                    throw new UnauthorizedError(ErrorMessage.UNAUTHORIZED);
                }
                userContext = {
                    userId: user.userId,
                    email: user.email,
                    role: "recruiter",
                    recruiterId: user.recruiter.recruiterId,
                };
                break;

            default:
                throw new UnauthorizedError(ErrorMessage.UNAUTHORIZED);
        }

        // Attach user context to request
        req.user = userContext;
        next();
    } catch (error) {
        next(error);
    }
};
