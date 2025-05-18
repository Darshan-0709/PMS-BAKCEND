import prisma from "../config/prisma";
import { ValidationError } from "../errors/ValidationError";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { PlacementCellUpdateData } from "../validators/placementCell.validator";
import { Prisma } from "@prisma/client";

export const getPlacementCellById = async (placementCellId: string) => {
    const placementCell = await prisma.placementCell.findUnique({
        where: {
            placementCellId,
            deletedAt: null,
        },
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
    data: PlacementCellUpdateData
) => {
    return prisma.$transaction(async (tx) => {
        await validatePlacementCellUpdate(tx, id, data);
        return executeUpdate(tx, id, data);
    });
};

// Helper function to validate the update operation
async function validatePlacementCellUpdate(
    tx: Prisma.TransactionClient,
    id: string,
    data: PlacementCellUpdateData
) {
    const existing = await tx.placementCell.findUnique({
        where: {
            placementCellId: id,
            deletedAt: null,
        },
        include: {
            placementCellDomains: { select: { domain: true } },
            placementCellDegrees: { select: { degreeId: true } },
        },
    });
    if (!existing) {
        throw new NotFoundError("Placement cell not found");
    }

    // Handle unique name constraint
    const nameConflict = await tx.placementCell.findFirst({
        where: {
            placementCellName: data.placementCellName,
            placementCellId: { not: id },
            deletedAt: null,
        },
    });
    if (nameConflict) {
        throw new ValidationError({
            placementCellName: "This placement cell name is already in use.",
        });
    }

    // Prevent degrees delete that still have students
    await validateDegreeRemoval(
        tx,
        id,
        existing.placementCellDegrees,
        data.degrees
    );
}

// Helper function to validate degree removal
async function validateDegreeRemoval(
    tx: Prisma.TransactionClient,
    placementCellId: string,
    currentDegrees: { degreeId: string }[],
    newDegrees: string[]
) {
    const currentDegreeIds = currentDegrees.map((d) => d.degreeId);
    const degreesToRemove = currentDegreeIds.filter(
        (degId) => !newDegrees.includes(degId)
    );

    if (degreesToRemove.length > 0) {
        const impactedStudents = await tx.student.findFirst({
            where: {
                placementCellId: placementCellId,
                degreeId: { in: degreesToRemove },
                deletedAt: null,
            },
        });
        if (impactedStudents) {
            throw new BadRequestError(
                "Cannot remove degrees that have associated students."
            );
        }
    }
}

// Helper function to execute the update operation
async function executeUpdate(
    tx: Prisma.TransactionClient,
    id: string,
    data: PlacementCellUpdateData
) {
    return await tx.placementCell.update({
        where: {
            placementCellId: id,
            deletedAt: null,
        },
        data: {
            // Scalar fields
            placementCellName: data.placementCellName,
            placementCellEmail: data.placementCellEmail,
            website: data.website,

            // Relations
            branch: {
                connect: { branchId: data.branchId },
            },

            // Domains relationship
            placementCellDomains: buildDomainUpdates(id, data.domains),

            // Degrees relationship
            placementCellDegrees: buildDegreeUpdates(id, data.degrees),
        },
        include: {
            branch: { select: { branchId: true, name: true } },
            placementCellDomains: { select: { domain: true } },
            placementCellDegrees: {
                select: { degree: { select: { degreeId: true, name: true } } },
            },
        },
    });
}

// Helper function to build domain update operations
function buildDomainUpdates(placementCellId: string, domains: string[]) {
    return {
        // Remove domains that aren't in the new list
        deleteMany: {
            domain: { notIn: domains },
        },

        // Upsert domains in the new list
        upsert: domains.map((domain) => ({
            where: {
                domain_placementCellId: {
                    domain,
                    placementCellId,
                },
            },
            create: { domain },
            update: { domain },
        })),
    };
}

// Helper function to build degree update operations
function buildDegreeUpdates(placementCellId: string, degrees: string[]) {
    return {
        // Remove degrees that aren't in the new list
        deleteMany: {
            degreeId: { notIn: degrees },
        },

        // Connect or create degrees from the new list
        connectOrCreate: degrees.map((degreeId) => ({
            where: {
                placementCellId_degreeId: {
                    placementCellId,
                    degreeId,
                },
            },
            create: { degreeId },
        })),
    };
}

export const softDeletePlacementCell = async (placementCellId: string) => {
    const placementCell = await prisma.placementCell.findUnique({
        where: {
            placementCellId,
            deletedAt: null,
        },
    });
    if (!placementCell) {
        throw new ValidationError({
            placementCell: "Placement cell not found",
        });
    }

    return prisma.placementCell.update({
        where: { placementCellId },
        data: { deletedAt: new Date() },
    });
};
