import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { ValidationError } from "../errors/ValidationError";
import { StudentUpdateInput } from "../validators/student.validator";
import { NotFoundError } from "../errors/NotFoundError";
import { StudentAttrs } from "../types";

export const getStudentById = async (studentId: string) => {
    const student = await prisma.student.findUnique({
        where: {
            studentId,
            deletedAt: null,
        },
        select: {
            studentId: true,
            enrollmentNumber: true,
            fullName: true,
            cgpa: true,
            bachelorsGpa: true,
            tenthPercentage: true,
            twelfthPercentage: true,
            diplomaPercentage: true,
            backlogs: true,
            liveBacklogs: true,
            placementStatus: true,
            resumeUrl: true,
            isVerifiedByPlacementCell: true,
            degree: {
                select: {
                    degreeId: true,
                    name: true,
                },
            },
            placement_cell: {
                select: {
                    placementCellId: true,
                    placementCellName: true,
                },
            },
        },
    });

    if (!student) {
        throw new ValidationError({ studentId: "Student not found" });
    }

    return student;
};

export const getStudentsByPlacementCell = async (
    placementCellId: string,
    page: number,
    pageSize: number
) => {
    const students = await prisma.student.findMany({
        where: {
            placementCellId,
            deletedAt: null,
        },
        select: {
            studentId: true,
            enrollmentNumber: true,
            fullName: true,
            cgpa: true,
            bachelorsGpa: true,
            tenthPercentage: true,
            twelfthPercentage: true,
            diplomaPercentage: true,
            backlogs: true,
            liveBacklogs: true,
            placementStatus: true,
            resumeUrl: true,
            isVerifiedByPlacementCell: true,
            degree: {
                select: {
                    degreeId: true,
                    name: true,
                },
            },
            placement_cell: {
                select: {
                    placementCellId: true,
                    placementCellName: true,
                },
            },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });

    const total = await prisma.student.count({
        where: {
            placementCellId,
            deletedAt: null,
        },
    });

    return { students, total };
};

export const updateStudent = async (
    studentId: string,
    data: StudentUpdateInput
) => {
    return prisma.$transaction(async (tx) => {
        // Validate the student exists and the update is allowed
        const { student, allowedFields } = await validateStudentUpdate(
            tx,
            studentId,
            data
        );

        // Filter the data to include only allowed fields based on policy
        const filteredData = filterAllowedFields(data, allowedFields);

        // Execute the update with the filtered data
        return executeStudentUpdate(tx, studentId, filteredData);
    });
};

// Validation logic with allowed fields determination
async function validateStudentUpdate(
    tx: Prisma.TransactionClient,
    studentId: string,
    data: StudentUpdateInput
): Promise<{ student: any; allowedFields: (keyof StudentAttrs)[] }> {
    // 1. Check student exists (excluding soft-deleted)
    const student = await tx.student.findUnique({
        where: {
            studentId,
            deletedAt: null,
        },
        include: {
            placement_cell: {
                include: {
                    placementCellDegrees: { select: { degreeId: true } },
                },
            },
            user: { select: { role: true } },
        },
    });

    if (!student) {
        throw new NotFoundError("Student not found");
    }

    // 2. Ensure unique enrollment number (across same placementCell)
    if (data.enrollmentNumber) {
        const conflict = await tx.student.findFirst({
            where: {
                enrollmentNumber: data.enrollmentNumber,
                placementCellId: student.placementCellId,
                studentId: { not: studentId },
                deletedAt: null,
            },
        });
        if (conflict) {
            throw new ValidationError({
                enrollmentNumber:
                    "Enrollment number already exists in this placement cell.",
            });
        }
    }

    // 3. Degree belongs to the placement cell (if changed)
    if (data.degreeId && student.placement_cell) {
        const isValidDegree = student.placement_cell.placementCellDegrees.some(
            (d) => d.degreeId === data.degreeId
        );
        if (!isValidDegree) {
            throw new ValidationError({
                degreeId:
                    "This degree is not associated with the student's placement cell.",
            });
        }
    }

    // 4. Determine allowed fields based on user role and verification status
    let allowedFields: (keyof StudentAttrs)[];

    // For placement cell admins - all fields are allowed
    if (student.user?.role === "placement_cell") {
        allowedFields = [
            "fullName",
            "enrollmentNumber",
            "degreeId",
            "cgpa",
            "bachelorsGpa",
            "tenthPercentage",
            "twelfthPercentage",
            "diplomaPercentage",
            "backlogs",
            "liveBacklogs",
            "placementStatus",
            "resumeUrl",
            "isVerifiedByPlacementCell",
        ];
    }
    // For students - restricted fields based on verification status
    else {
        if (!student.isVerifiedByPlacementCell) {
            // Unverified students can update these fields
            allowedFields = [
                "fullName",
                "cgpa",
                "bachelorsGpa",
                "tenthPercentage",
                "twelfthPercentage",
                "diplomaPercentage",
                "backlogs",
                "liveBacklogs",
            ];
        } else {
            // Verified students can only update resume
            allowedFields = [];
        }
    }

    return { student, allowedFields };
}

// Filter data to only include allowed fields
function filterAllowedFields(
    data: StudentUpdateInput,
    allowedFields: (keyof StudentAttrs)[]
): StudentUpdateInput {
    const filtered: Partial<StudentUpdateInput> = {};

    for (const field of allowedFields) {
        if (field in data && field in data) {
            // Type assertion to handle the mismatch between StudentAttrs and StudentUpdateInput
            (filtered as any)[field] = data[field as keyof typeof data];
        }
    }

    return filtered as StudentUpdateInput;
}

async function executeStudentUpdate(
    tx: Prisma.TransactionClient,
    studentId: string,
    data: StudentUpdateInput
) {
    return tx.student.update({
        where: {
            studentId,
            deletedAt: null,
        },
        data,
        select: {
            studentId: true,
            enrollmentNumber: true,
            fullName: true,
            cgpa: true,
            bachelorsGpa: true,
            tenthPercentage: true,
            twelfthPercentage: true,
            diplomaPercentage: true,
            backlogs: true,
            liveBacklogs: true,
            placementStatus: true,
            resumeUrl: true,
            isVerifiedByPlacementCell: true,
            degree: {
                select: {
                    degreeId: true,
                    name: true,
                },
            },
            placement_cell: {
                select: {
                    placementCellId: true,
                    placementCellName: true,
                },
            },
        },
    });
}

export const softDeleteStudent = async (studentId: string) => {
    const student = await prisma.student.findUnique({
        where: {
            studentId,
            deletedAt: null,
        },
    });

    if (!student) {
        throw new ValidationError({ studentId: "Student not found" });
    }

    return prisma.student.update({
        where: { studentId },
        data: { deletedAt: new Date() },
    });
};

export const batchVerifyStudents = async (
    studentIds: string[],
    isVerifiedByPlacementCell: boolean
) => {
    return prisma.student.updateMany({
        where: {
            studentId: { in: studentIds },
            deletedAt: null,
        },
        data: { isVerifiedByPlacementCell },
    });
};
