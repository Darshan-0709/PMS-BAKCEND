import prisma from "src/config/prisma";
import { JobRequestDto } from "../validators/jobRequest.validator";
import { BadRequestError } from "src/errors/BadRequestError";
import { ValidationError } from "src/errors/ValidationError";
import { JobRequest } from "@prisma/client";

const JOB_REQUEST_BASE_SELECT = {
    jobRequestId: true,
    title: true,
    description: true,
    salary: true,
    stipend: true,
    location: true,
    jobType: true,
    status: true,
    allowAllDegrees: true,

    eligibilityCriteria: {
        select: {
            criteriaId: true,
            minCgpa: true,
            minBachelorsGpa: true,
            minTenthPercentage: true,
            minTwelfthPercentage: true,
            minDiplomaPercentage: true,
            maxBacklogs: true,
            maxLiveBacklogs: true,
        },
    },
    allowedDegrees: {
        select: {
            degree: {
                select: {
                    degreeId: true,
                    name: true,
                },
            },
        },
    },
} as const;

export const getAllJobRequest = async (recruiterId: string) => {
    const jobRequests = await prisma.jobRequest.findMany({
        where: { recruiterId, deletedAt: null },
        select: JOB_REQUEST_BASE_SELECT,
    });

    return jobRequests.map((jobRequest) => ({
        ...jobRequest,
        allowedDegrees: jobRequest.allowedDegrees.map((ad) => ({
            degreeId: ad.degree.degreeId,
            name: ad.degree.name,
        })),
    }));
};

export const softDeleteJobRequest = async (
    jobRequestId: string
): Promise<void> => {
    const result = await prisma.jobRequest.update({
        where: {
            jobRequestId,
            deletedAt: null,
        },
        data: {
            deletedAt: new Date(),
        },
    });

    if (!result) {
        throw new BadRequestError(
            `Job request not found or already deleted (id: ${jobRequestId})`
        );
    }
};

export const getJobRequestById = async (jobRequestId: string) => {
    const jobRequest = await prisma.jobRequest.findUnique({
        where: { jobRequestId, deletedAt: null },
        select: JOB_REQUEST_BASE_SELECT,
    });
    if (!jobRequest) {
        throw new BadRequestError("Incorrect Id provided");
    }
    return {
        ...jobRequest,
        allowedDegrees: jobRequest.allowedDegrees.map((ad) => ({
            degreeId: ad.degree.degreeId,
            name: ad.degree.name,
        })),
    };
};

export const createJobRequest = async (
    params: JobRequestDto,
    recruiterId: string
) => {
    // 1. Verify recruiter exists
    const recruiter = await prisma.recruiter.findUnique({
        where: { recruiterId },
    });
    if (!recruiter) {
        throw new BadRequestError("Recruiter not found");
    }

    // 2. Verify eligibility criteria belongs to recruiter
    const criteria = await prisma.eligibilityCriteria.findUnique({
        where: {
            criteriaId: params.eligibilityCriteriaId,
            recruiterId,
        },
    });
    if (!criteria) {
        throw new ValidationError({
            eligibilityCriteriaId:
                "Invalid or unauthorized eligibility criteria",
        });
    }

    const isWildcard = params.allowedDegrees.length === 0;
    // 3. Conditionally validate & prepare degrees
    if (!isWildcard) {
        const existingDegrees = await prisma.degree.findMany({
            where: { degreeId: { in: params.allowedDegrees } },
            select: { degreeId: true },
        });
        const existingIds = new Set(existingDegrees.map((d) => d.degreeId));
        const missing = params.allowedDegrees.filter(
            (id) => !existingIds.has(id)
        );
        if (missing.length) {
            throw new ValidationError({
                allowedDegrees: `degree IDs are invalid: ${missing.join(", ")}`,
            });
        }
    }

    // 4. Create job request (nested write only if needed)
    const jr = await prisma.jobRequest.create({
        data: {
            title: params.title,
            description: params.description,
            salary: params.salary,
            stipend: params.stipend,
            location: params.location,
            jobType: params.jobType,
            status: params.status,
            allowAllDegrees: isWildcard,

            recruiter: { connect: { recruiterId } },
            eligibilityCriteria: {
                connect: { criteriaId: criteria.criteriaId },
            },

            ...(!isWildcard && {
                allowedDegrees: {
                    createMany: {
                        data: params.allowedDegrees.map((degreeId) => ({
                            degreeId,
                        })),
                        skipDuplicates: true,
                    },
                },
            }),
        },
        select: JOB_REQUEST_BASE_SELECT,
    });

    // 5. Flatten allowedDegrees and return DTO
return {
    ...jr,
    allowedDegrees: jr.allowAllDegrees
      ? []
      : jr.allowedDegrees.map(ad => ad.degree),
  };
};
