import prisma from "../config/prisma";
import { ValidationError } from "../errors/ValidationError";
import { RecruiterUpdateData } from "../validators/recruiter.validator";

export const getRecruiterById = async (recruiterId: string) => {
    // select public fields
    const recruiter = await prisma.recruiter.findUnique({
        where: { recruiterId, deletedAt: null },
        select: {
            recruiterId: true,
            companyName: true,
            companyEmail: true,
            representativePosition: true,
            description: true,
            website: true,
        },
    });
    if (!recruiter) {
        throw new ValidationError({ recruiter: "Recruiter not found" });
    }
    return recruiter;
};

export const updateRecruiter = async (
    recruiterId: string,
    data: RecruiterUpdateData
) => {
    // Check if recruiter exists
    const existingRecruiter = await prisma.recruiter.findUnique({
        where: { recruiterId },
    });

    if (!existingRecruiter) {
        throw new ValidationError({ recruiter: "Recruiter not found" });
    }

    // Check uniqueness of companyName if being updated
    if (data.companyName) {
        const recruiterWithSameCompany = await prisma.recruiter.findUnique({
            where: { companyName: data.companyName },
        });

        if (
            recruiterWithSameCompany &&
            recruiterWithSameCompany.recruiterId !== recruiterId
        ) {
            throw new ValidationError({
                companyName: "Company name already taken",
            });
        }
    }

    // Perform update and select public fields
    const updatedRecruiter = await prisma.recruiter.update({
        where: { recruiterId },
        data,
        select: {
            recruiterId: true,
            companyName: true,
            companyEmail: true,
            representativePosition: true,
            description: true,
            website: true,
        },
    });

    return {
        message: "Recruiter updated successfully",
        data: updatedRecruiter,
    };
};

export const deleteRecruiter = async (recruiterId: string) => {
    const recruiter = await prisma.recruiter.findUnique({
        where: { recruiterId },
    });

    if (!recruiter) {
        throw new ValidationError({ recruiter: "Recruiter not found" });
    }

    // Soft delete
    await prisma.recruiter.update({
        where: { recruiterId },
        data: { deletedAt: new Date() },
    });

    return { message: "Recruiter deleted successfully" };
};
