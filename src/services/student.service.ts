import prisma from "../config/prisma";
import { ValidationError } from "../errors/ValidationError";
import { StudentUpdateInput } from "../validators/student.validator";

export const getStudentById = async (studentId: string) => {
    const student = await prisma.student.findUnique({
        where: { studentId },
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
        where: { placementCellId },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });

    const total = await prisma.student.count({ where: { placementCellId } });

    return { students, total };
};

export const updateStudent = async (
    studentId: string,
    data: StudentUpdateInput
) => {
    const student = await prisma.student.findUnique({
        where: { studentId },
    });

    if (!student) {
        throw new ValidationError({ studentId: "Student not found" });
    }

    return prisma.student.update({
        where: { studentId },
        data,
    });
};

export const softDeleteStudent = async (studentId: string) => {
    const student = await prisma.student.findUnique({
        where: { studentId },
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
        where: { studentId: { in: studentIds } },
        data: { isVerifiedByPlacementCell },
    });
};
