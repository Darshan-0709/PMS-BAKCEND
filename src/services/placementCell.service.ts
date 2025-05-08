import prisma from "../config/prisma";
import { ValidationError } from "../errors/ValidationError";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
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
            placementCellName: true,
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
    // Check if placement cell exists
    const existingPlacementCell = await prisma.placementCell.findUnique({
        where: { placementCellId: id },
        include: {
            placementCellDegrees: {
                select: {
                    degreeId: true,
                },
            },
            placementCellDomains: {
                select: {
                    domain: true,
                },
            },
        },
    });

    if (!existingPlacementCell) {
        throw new NotFoundError();
    }

    // Check if the new placementCellName already exists
    if (data.placementCellName) {
        const nameExists = await prisma.placementCell.findUnique({
            where: { placementCellName: data.placementCellName },
        });

        if (nameExists && nameExists.placementCellId !== id) {
            throw new ValidationError({
                placementCellName: "Placement cell name already exists.",
            });
        }
    }

    // Handle degrees updates
    let degreeUpdates;
    if (data.degrees) {
        // Verify all degrees exist
        const existingDegrees = await prisma.degree.findMany({
            where: {
                degreeId: {
                    in: data.degrees,
                },
            },
        });

        if (existingDegrees.length !== data.degrees.length) {
            // Some degrees don't exist
            const foundDegreeIds = existingDegrees.map((d) => d.degreeId);
            const notFoundDegrees = data.degrees.filter(
                (id) => !foundDegreeIds.includes(id)
            );
            throw new ValidationError({
                degrees: `Degrees with IDs [${notFoundDegrees.join(", ")}] not found`,
            });
        }

        // Extract existing degree IDs
        const existingDegreeIds =
            existingPlacementCell.placementCellDegrees.map(
                (pcd) => pcd.degreeId
            );

        // Check if any existing degrees would be removed
        const degreesToRemove = existingDegreeIds.filter(
            (id) => !data.degrees?.includes(id)
        );

        // Check if degrees to remove have associated students
        if (degreesToRemove.length > 0) {
            const studentsWithDegrees = await prisma.student.findMany({
                where: {
                    placementCellId: id,
                    degreeId: {
                        in: degreesToRemove,
                    },
                },
            });

            if (studentsWithDegrees.length > 0) {
                throw new BadRequestError(
                    "Cannot remove degrees that have associated students"
                );
            }
        }

        // Prepare degree updates
        degreeUpdates = {
            // Delete all existing connections
            deleteMany: {},
            // Create new connections
            create: data.degrees.map((degreeId) => ({
                degreeId,
            })),
        };
    }

    // Handle domains updates
    let domainUpdates;
    if (data.domains) {
        // Prepare domain updates
        domainUpdates = {
            // Delete all existing connections
            deleteMany: {},
            // Create new connections
            create: data.domains.map((domain) => ({
                domain,
            })),
        };
    }

    // Create prisma update object
    const updateData: any = {};

    // Basic fields
    if (data.placementCellName)
        updateData.placementCellName = data.placementCellName;
    if (data.placementCellEmail)
        updateData.placementCellEmail = data.placementCellEmail;
    if (data.website) updateData.website = data.website;

    // Relation updates
    if (degreeUpdates) updateData.placementCellDegrees = degreeUpdates;
    if (domainUpdates) updateData.placementCellDomains = domainUpdates;

    // Proceed with the update
    return prisma.placementCell.update({
        where: { placementCellId: id },
        data: updateData,
        include: {
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
