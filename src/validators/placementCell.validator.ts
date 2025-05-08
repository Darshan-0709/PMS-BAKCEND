import { z } from "zod";

export const placementCellIdSchema = z.object({
    id: z.string().uuid("Invalid placement cell ID"),
});

export const placementCellUpdateSchema = z.object({
    placementCellName: z
        .string()
        .min(1, "Placement cell name is required")
        .optional(),
    placementCellEmail: z.string().email("Invalid email address").optional(),
    website: z.string().url("Invalid website URL").optional(),
    domains: z.array(z.string().min(1, "Domain cannot be empty")).optional(),
    degrees: z.array(z.string().uuid("Invalid degree ID")).optional(),
});

export type PlacementCellUpdateInput = z.infer<
    typeof placementCellUpdateSchema
>;
