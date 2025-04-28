import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../utils/response";

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
    ResponseHandler.success(res, branches);
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
    ResponseHandler.success(res, degrees);
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

    const placementCells = await prisma.placementCell.findMany({
      where: branchParam ? { branchId: branchParam } : undefined,
      select: {
        placementCellId: true,
        name: true,
        branchId: true,
        placementCellDegrees: {
          select: {
            degree: {
              select: {
                degreeId: true,
                name: true
              }
            }
          }
        }
      }
    });

    ResponseHandler.success(res, placementCells);
  } catch (err) {
    next(err);
  }
};
