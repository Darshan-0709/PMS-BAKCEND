import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../utils/apiResponse";

const prisma = new PrismaClient();

export const getBranches = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const branches = await prisma.branch.findMany({
            select: {
                branchId: true,
                name: true,
            },
            orderBy: { name: "asc" },
        });
        ResponseHandler.fetched(res, branches);
    } catch (err) {
        next(err);
    }
};

export const getDegrees = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const degrees = await prisma.degree.findMany({
            select: {
                degreeId: true,
                name: true,
            },
            orderBy: { name: "asc" },
        });
        ResponseHandler.fetched(res, degrees);
    } catch (err) {
        next(err);
    }
};

export const getPlacementCellForStudentRegister = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const branchParam = req.query.branch as string | undefined;

        const placementCellsRaw = await prisma.placementCell.findMany({
            where: branchParam ? { branchId: branchParam } : undefined,
            select: {
                placementCellId: true,
                placementCellName: true,
                branch: {
                    select: {
                        branchId: true,
                        name: true,
                    },
                },
                placementCellDegrees: {
                    select: {
                        degree: {
                            select: {
                                degreeId: true,
                                name: true,
                            },
                        },
                    },
                },
                placementCellDomains: {
                    select: {
                        domain: true,
                    },
                },
            },
        });

        const placementCells = placementCellsRaw.map((cell) => ({
            ...cell,
            placementCellDegrees: cell.placementCellDegrees.map(
                (d) => d.degree
            ),
            placementCellDomains: cell.placementCellDomains.map(
                (domain) => domain.domain
            ),
        }));

        console.log(placementCells);
        ResponseHandler.fetched(res, placementCells);
    } catch (err) {
        next(err);
    }
};
