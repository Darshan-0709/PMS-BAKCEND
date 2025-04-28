import { z } from "zod";
import { Role } from "@prisma/client";

// Common user validation schema
export const userValidationSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    role: z.nativeEnum(Role),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Student profile data validation
const studentRegisterSchema = z.object({
  enrollmentNumber: z.string().min(1),
  fullName: z.string().min(1),
  degreeId: z.string().min(1),
  placementCellId: z.string(),
});

// Placement Cell profile data validation
const placementCellRegisterSchema = z.object({
  name: z.string().min(1),
  domains: z.array(z.string()).min(1),
  branchName: z.string().min(1),
  degreeNames: z.array(z.string()).min(1),
  email: z.string().email(),
  website: z.string().url(),
});

// Recruiter profile data validation
const recruiterRegisterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  representativePosition: z
    .string()
    .min(1, "Representative position is required"),
  description: z.string(),
  website: z.string().url("Invalid website URL"),
  email: z.string().email("Invalid email address"),
});

// Union schema to validate based on role, with each profile's data specifically named
export const registerValidationSchema = userValidationSchema.and(
  z.union([
    // Student role validation
    z.object({
      role: z.literal(Role.student),
      studentProfileData: studentRegisterSchema,
    }),

    // Placement cell role validation
    z.object({
      role: z.literal(Role.placement_cell),
      placementCellProfileData: placementCellRegisterSchema,
    }),

    // Recruiter role validation
    z.object({
      role: z.literal(Role.recruiter),
      recruiterProfileData: recruiterRegisterSchema,
    }),
  ])
);
