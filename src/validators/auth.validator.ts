import { z } from "zod";
import { Role } from "@prisma/client";

// ─── Common User Schema ────────────────────────────────────────────────────────
export const userValidationSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
    role: z.nativeEnum(Role, { 
      errorMap: () => ({ message: "Invalid role" }) 
    }),
  })

// ─── Student Profile Schema ──────────────────────────────────────────────────
// Based on Prisma Student model (only the “registration‐required” fields)
const studentRegisterSchema = z
  .object({
    enrollmentNumber: z.string().min(1, "Enrollment number is required"),
    fullName: z.string().min(1, "Full name is required"),
    degreeId: z.string().min(1, "Degree ID is required"),
    placementCellId: z.string().min(1, "Placement cell ID is required"),
  })
  .strict();

// ─── Placement Cell Profile Schema ───────────────────────────────────────────
// Based on Prisma PlacementCell model + nested domain/degree lists
const placementCellRegisterSchema = z
  .object({
    placementCellName: z.string().min(1, "Placement cell name is required"),
    placementCellEmail: z.string().email("Invalid placement cell email"),
    website: z.string().url("Invalid website URL"),
    branchId: z.string().min(1, "Branch ID is required"),
    domains: z
      .array(z.string().min(1))
      .min(1, "At least one domain is required"),
    degrees: z
      .array(z.string().min(1))
      .min(1, "At least one degree ID is required"),
  })
  .strict();

// ─── Recruiter Profile Schema ────────────────────────────────────────────────
// Based on Prisma Recruiter model
const recruiterRegisterSchema = z
  .object({
    companyName: z.string().min(1, "Company name is required"),
    representativePosition: z
      .string()
      .min(1, "Representative position is required"),
    description: z.string(),
    website: z.string().url("Invalid website URL"),
    companyEmail: z.string().email("Invalid company email"),
  })
  .strict();

// ─── Combined Registration Schema ─────────────────────────────────────────────
export const registerValidationSchema = z.discriminatedUnion("role", [
  userValidationSchema
    .extend({ role: z.literal(Role.student) })
    .extend({ studentProfileData: studentRegisterSchema }),

  userValidationSchema
    .extend({ role: z.literal(Role.placement_cell) })
    .extend({ placementCellProfileData: placementCellRegisterSchema }),

  userValidationSchema
    .extend({ role: z.literal(Role.recruiter) })
    .extend({ recruiterProfileData: recruiterRegisterSchema }),
]);