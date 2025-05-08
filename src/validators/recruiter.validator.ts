import { z } from "zod";

export const recruiterIdSchema = z.object({
    id: z.string().uuid("Invalid recruiter ID"),
});

export const recruiterUpdateSchema = z.object({
    companyName: z.string().min(1, "Company name is required").optional(),
    representativePosition: z
        .string()
        .min(1, "Representative position is required")
        .optional(),
    description: z.string().optional(),
    website: z.string().url("Invalid website URL").optional(),
    companyEmail: z.string().email("Invalid email address").optional(),
    // Exclude fields that shouldn't be updated
});

export type RecruiterUpdateInput = z.infer<typeof recruiterUpdateSchema>;
