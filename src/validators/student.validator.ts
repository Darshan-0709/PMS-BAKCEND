import { z } from "zod";
import { PlacementStatus } from "@prisma/client";

export const studentIdSchema = z.object({
    id: z.string().uuid("Invalid student ID"),
});

export const studentUpdateSchema = z.object({
    fullName: z.string().min(1, "Full name is required").optional(),
    enrollmentNumber: z.string().min(1).optional(),
    degreeId: z.string().uuid("Invalid degree ID").optional(),
    cgpa: z.number().min(0).max(10).optional(),
    bachelorsGpa: z.number().min(0).max(10).optional(),
    tenthPercentage: z.number().min(0).max(100).optional(),
    twelfthPercentage: z.number().min(0).max(100).optional(),
    diplomaPercentage: z.number().min(0).max(100).optional(),
    backlogs: z.number().min(0).optional(),
    liveBacklogs: z.number().min(0).optional(),
    placementStatus: z.nativeEnum(PlacementStatus).optional(),
    isVerifiedByPlacementCell: z.boolean().optional(),
}).strip();

export const studentBatchVerifySchema = z.object({
    studentIds: z.array(z.string().uuid("Invalid student ID")),
    isVerifiedByPlacementCell: z.boolean(),
});

export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
export type StudentBatchVerifyInput = z.infer<typeof studentBatchVerifySchema>;
