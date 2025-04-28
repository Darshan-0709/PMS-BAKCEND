import { Role } from "@prisma/client";

// Base user registration data
export interface RegisterBaseData {
  email: string;
  username: string;
  password: string;
  role: Role;
}

// Student profile data
export interface StudentProfileData {
  enrollmentNumber: string;
  fullName: string;
  degreeId: string;
  placementCellId: string;
}

// Placement cell profile data
export interface PlacementCellProfileData {
  name: string;
  domains: string[];
  branchName: string;
  degreeNames: string[];
  email: string;
  website: string;
}

// Recruiter profile data
export interface RecruiterProfileData {
  companyName: string;
  representativePosition: string;
  description: string;
  website: string;
  email: string;
}

// Register input based on role with specific profile data
export type RegisterInput =
  | (RegisterBaseData & { role: "student"; studentProfileData: StudentProfileData })
  | (RegisterBaseData & { role: "placement_cell"; placementCellProfileData: PlacementCellProfileData })
  | (RegisterBaseData & { role: "recruiter"; recruiterProfileData: RecruiterProfileData });
