import { z } from "zod";

export const placementCellIdSchema = z.object({
    id: z.string().uuid("Invalid placement cell ID"),
});

export const placementCellUpdateSchema = z
    .object({
        placementCellName: z.string().min(1, "Placement cell name is required"),
        placementCellEmail: z.string().email("Invalid email address"),
        website: z.string().url("Invalid website URL"),
        branchId: z.string().uuid("Invalid branch ID"),
        domains: z
            .array(z.string().min(1))
            .min(1, "At least one domain is required"),
        degrees: z
            .array(z.string().uuid("Invalid degree ID"))
            .min(1, "At least one degree ID is required"),
    })
    .strict();

export type PlacementCellUpdateData = z.infer<typeof placementCellUpdateSchema>;
