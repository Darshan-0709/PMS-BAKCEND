import { z } from "zod";

export const eligibilityCriteriaSchema = z.object({
    minCgpa: z.number().min(0).max(10).optional(),
    minBachelorsGpa: z.number().min(0).max(10).optional(),
    minTenthPercentage: z.number().min(0).max(100).optional(),
    minTwelfthPercentage: z.number().min(0).max(100).optional(),
    minDiplomaPercentage: z.number().min(0).max(100).optional(),
    maxBacklogs: z.number().min(0).optional(),
    maxLiveBacklogs: z.number().min(0).optional(),
});

export const eligibilityCriteriaUpdateSchema =
    eligibilityCriteriaSchema.partial();

export const eligibilityCriteriaIdSchema = z.object({
    id: z.string().uuid(),
});

export type EligibilityCriteriaDto = z.infer<typeof eligibilityCriteriaSchema>;
export type EligibilityCriteriaUpdateDto = z.infer<
    typeof eligibilityCriteriaUpdateSchema
>;
