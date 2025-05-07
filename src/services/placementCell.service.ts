import prisma from "../config/prisma";
import { ValidationError } from "../errors/ValidationError";
import { PlacementCellUpdateInput } from "../validators/placementCell.validator";

export const getPlacementCellById = async (placementCellId: string) => {
    const placementCell = await prisma.placementCell.findUnique({
        where: { placementCellId },
        select: {
            branch: {
                select: {
                    branchId: true,
                    name: true,
                },
            },
            placementCellEmail: true,
            website: true,
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

    if (!placementCell) {
        throw new ValidationError({
            placementCellId: "Placement cell not found",
        });
    }

    return placementCell;
};

export const updatePlacementCell = async (
    id: string,
    data: PlacementCellUpdateInput
) => {
    // Check if the new placementCellName already exists
    if (data.placementCellName) {
        const existingPlacementCell = await prisma.placementCell.findUnique({
            where: { placementCellName: data.placementCellName },
        });

        if (
            existingPlacementCell &&
            existingPlacementCell.placementCellId !== id
        ) {
            throw new ValidationError({
                placementCellName: "Placement cell name already exists.",
            });
        }
    }

    // Proceed with the update
    return prisma.placementCell.update({
        where: { placementCellId: id },
        data,
    });
};

export const softDeletePlacementCell = async (placementCellId: string) => {
    const placementCell = await prisma.placementCell.findUnique({
        where: { placementCellId },
    });
    if (!placementCell) {
        throw new ValidationError({
            placementCellId: "Placement cell not found",
        });
    }

    return prisma.placementCell.update({
        where: { placementCellId },
        data: { deletedAt: new Date() },
    });
};
