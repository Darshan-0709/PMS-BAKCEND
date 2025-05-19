import { Role, Student } from "@prisma/client";

export interface RegisterBaseData {
    email: string;
    username: string;
    password: string;
    confirmPassword: string,
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
    placementCellName: string;
    placementCellEmail: string;
    website: string;
    branchId: string;
    domains: string[];
    degrees: string[];
}

export type StudentAttrs = Partial<
    Pick<
        Student,
        | "fullName"
        | "cgpa"
        | "bachelorsGpa"
        | "tenthPercentage"
        | "twelfthPercentage"
        | "diplomaPercentage"
        | "backlogs"
        | "liveBacklogs"
        | "resumeUrl"
        | "enrollmentNumber"
        | "placementStatus"
        | "isVerifiedByPlacementCell"
        | "degreeId"
    >
>;

// Recruiter profile data
export interface RecruiterProfileData {
    companyName: string;
    representativePosition: string;
    description: string;
    website: string;
    companyEmail: string;
}

export interface AuthResponse {
    token: string;
    user: {
        userId: string;
        email: string;
        role: string;
        studentId?: string; // Optional for students
        placementCellId?: string; // Optional for placement cell admins
        recruiterId?: string; // Optional for recruiters
    };
}

// Register input based on role with specific profile data
export type RegisterInput =
    | (RegisterBaseData & {
          role: "student";
          studentProfileData: StudentProfileData;
      })
    | (RegisterBaseData & {
          role: "placement_cell";
          placementCellProfileData: PlacementCellProfileData;
      })
    | (RegisterBaseData & {
          role: "recruiter";
          recruiterProfileData: RecruiterProfileData;
      });
