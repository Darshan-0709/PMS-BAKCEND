import { EligibilityCriteria, PrismaClient } from "@prisma/client";
import {
    EligibilityCriteriaDto,
    EligibilityCriteriaUpdateDto,
} from "../validators/eligibilityCriteria.validator";
import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";

const prisma = new PrismaClient();

export const createEligibilityCriteria = async (
    data: EligibilityCriteriaDto,
    userId: string
): Promise<EligibilityCriteria> => {
    // Get recruiter ID
    const recruiter = await prisma.recruiter.findUnique({
        where: { representativeId: userId },
    });

    if (!recruiter) {
        throw new BadRequestError("Recruiter not found");
    }

    return prisma.eligibilityCriteria.create({
        data: {
            ...data,
            recruiterId: recruiter.recruiterId,
        },
    });
};

export const getEligibilityCriteriaById = async (
    id: string
): Promise<EligibilityCriteria> => {
    const criteria = await prisma.eligibilityCriteria.findUnique({
        where: { criteriaId: id, deletedAt: null },
    });

    if (!criteria) {
        throw new NotFoundError("Eligibility criteria not found");
    }

    return criteria;
};

export const getAllEligibilityCriteriaForRecruiter = async (
    userId: string
): Promise<EligibilityCriteria[]> => {
    const recruiter = await prisma.recruiter.findUnique({
        where: { representativeId: userId },
    });

    if (!recruiter) {
        throw new BadRequestError("Recruiter not found");
    }

    return prisma.eligibilityCriteria.findMany({
        where: {
            recruiterId: recruiter.recruiterId,
            deletedAt: null,
        },
    });
};

export const updateEligibilityCriteria = async (
    id: string,
    data: EligibilityCriteriaUpdateDto
): Promise<EligibilityCriteria> => {
    const criteria = await prisma.eligibilityCriteria.findUnique({
        where: { criteriaId: id, deletedAt: null },
    });

    if (!criteria) {
        throw new NotFoundError("Eligibility criteria not found");
    }

    return prisma.eligibilityCriteria.update({
        where: { criteriaId: id },
        data,
    });
};

export const softDeleteEligibilityCriteria = async (
    id: string
): Promise<void> => {
    return prisma.$transaction(async (tx) => {
        // Check if criteria exists
        const criteria = await tx.eligibilityCriteria.findUnique({
            where: { criteriaId: id, deletedAt: null },
        });

        if (!criteria) {
            throw new NotFoundError("Eligibility criteria not found");
        }

        // Check for linked job requests
        const linkedJobs = await tx.jobRequest.findFirst({
            where: {
                eligibilityCriteriaId: id,
                deletedAt: null,
            },
        });

        if (linkedJobs) {
            throw new BadRequestError(
                "Cannot delete criteria that is linked to active job requests"
            );
        }

        // Soft delete
        await tx.eligibilityCriteria.update({
            where: { criteriaId: id },
            data: { deletedAt: new Date() },
        });
    });
};
