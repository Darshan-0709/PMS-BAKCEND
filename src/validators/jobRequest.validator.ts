import { JobRequestStatus, JobType } from "@prisma/client";
import { z } from "zod";

export const jobRequestSchema = z.object({
    title:  z.string().min(3),
    description:  z.string().min(10).optional(),
    salary:  z.number().min(0).optional(),
    stipend:  z.number().min(0).optional(),
    location:  z.string().min(3).optional(),
    jobType:  z.nativeEnum(JobType),
    eligibilityCriteriaId: z.string().uuid(),
    allowedDegrees: z.array(z.string().uuid()),
    status:  z.nativeEnum(JobRequestStatus),
}).strip();

export const eligibilityCriteriaIdSchema = z.object({
    id: z.string().uuid(),
});

export type JobRequestDto = z.infer<typeof jobRequestSchema>;
export type JobRequestUpdateDto = z.infer<typeof jobRequestSchema>;
