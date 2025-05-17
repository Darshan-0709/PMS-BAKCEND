import { z } from "zod";

export const recruiterIdSchema = z.object({
    id: z.string().uuid("Invalid recruiter ID"),
});

export const recruiterUpdateSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    companyEmail: z.string().email("Invalid email address"),
    representativePosition: z
        .string()
        .min(1, "Representative position is required"),
    description: z.string(),
    website: z.string().url("Invalid website URL"),
});

export type RecruiterUpdateInput = z.infer<typeof recruiterUpdateSchema>;
