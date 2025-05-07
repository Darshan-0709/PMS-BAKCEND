import prisma from "../config/prisma";
import { ValidationError } from "../errors/ValidationError";
import { RecruiterUpdateInput } from "../validators/recruiter.validator";

export const getRecruiterById = async (recruiterId: string) => {
    const recruiter = await prisma.recruiter.findUnique({
        where: { recruiterId },
        select: {
            companyName: true,
            representativePosition: true,
            description: true,
            website: true,
            companyEmail: true,
        },
    });
    if (!recruiter) {
        throw new ValidationError({ recruiterId: "Recruiter not found" });
    }
    return recruiter;
};

export const updateRecruiter = async (
    recruiterId: string,
    data: RecruiterUpdateInput
) => {
    const recruiter = await prisma.recruiter.findUnique({
        where: { recruiterId },
    });
    if (!recruiter) {
        throw new ValidationError({ recruiterId: "Recruiter not found" });
    }

    const companyName = data.companyName;
    if (companyName) {
        const recruiterWithSameCompanyName = await prisma.recruiter.findUnique({
            where: { companyName },
        });
        if (
            recruiterWithSameCompanyName &&
            recruiterWithSameCompanyName.recruiterId !== recruiterId
        ) {
            throw new ValidationError({
                companyName: "Company name already taken",
            });
        }
    }

    return prisma.recruiter.update({
        where: { recruiterId },
        data,
    });
};

export const deleteRecruiter = async (recruiterId: string) => {
    const recruiter = await prisma.recruiter.findUnique({
        where: { recruiterId },
    });
    if (!recruiter) {
        throw new ValidationError({ recruiterId: "Recruiter not found" });
    }

    return prisma.recruiter.delete({ where: { recruiterId } });
};
