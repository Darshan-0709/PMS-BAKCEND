import { Request, Response, NextFunction } from "express";
import {
    PrismaClient,
    Student,
    PlacementCell,
    Recruiter,
    Role,
    Prisma,
} from "@prisma/client";
import { UserContext } from "./userContext";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";

const prisma = new PrismaClient();

type Action = "read" | "create" | "update" | "delete";

// Extend this type to add more resources as needed
export type Resource = "Student" | "PlacementCell" | "Recruiter";
// Add more resources here
// | "Drive"
// | "Application"

// Map resource types to their Prisma model types
type ResourceMap = {
    Student: Student;
    PlacementCell: PlacementCell;
    Recruiter: Recruiter;
    // Add more resources here with their types
    // Drive: Drive;
    // Application: Application;
};

// Simplify context passing for related data lookup
export interface PolicyContext<R extends Resource> {
    user: UserContext;
    resource?: ResourceMap[R];
    resourceId?: string;
    attrs?: Partial<ResourceMap[R]>;
    // Add a custom lookup function for related resources
    getRelatedResource: <T extends Resource>(
        resource: T,
        id: string
    ) => Promise<ResourceMap[T] | null>;
}

export type PolicyFn<R extends Resource> = (
    context: PolicyContext<R>
) => boolean | Promise<boolean>;

type PolicyRules = {
    [R in Resource]?: {
        [A in Action]?: PolicyFn<R>;
    };
};

// Type-safe policy structure
const policies: Record<Role, PolicyRules> = {
    student: {},
    placement_cell: {},
    recruiter: {},
};

// Register policy rules
export function definePolicy<RL extends Role>(role: RL, rules: PolicyRules) {
    policies[role] = { ...policies[role], ...rules };
}

// Factory for creating related resource lookup functions
async function createResourceLookup(_userCtx: UserContext) {
    // Cache to avoid duplicate database queries
    const cache = new Map<string, unknown>();

    return async function getRelatedResource<T extends Resource>(
        resource: T,
        id: string
    ): Promise<ResourceMap[T] | null> {
        const cacheKey = `${resource}:${id}`;
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey) as ResourceMap[T] | null;
        }

        // Lookup logic based on resource type
        let result = null;
        switch (resource) {
            case "Student":
                result = await prisma.student.findUnique({
                    where: { studentId: id },
                });
                break;
            case "PlacementCell":
                result = await prisma.placementCell.findUnique({
                    where: { placementCellId: id },
                });
                break;
            case "Recruiter":
                result = await prisma.recruiter.findUnique({
                    where: { recruiterId: id },
                });
                break;
            // Add more cases for other resources
            // case "Drive":
            //   result = await prisma.drive.findUnique({ where: { driveId: id } });
            //   break;
        }

        if (result) {
            cache.set(cacheKey, result);
        }
        return result as ResourceMap[T] | null;
    };
}

// This function can be used when you need to implement complex relationship resolution
// Currently unused but kept for future implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function resolveIndirectRelationship<R extends Resource>(
    _userCtx: UserContext,
    _resourceType: R,
    _targetId: string
): Promise<boolean> {
    // This is where you'd implement the logic for complex relationships
    // Example for student-recruiter relationship through applications:

    // if (resourceType === "Student" && userCtx.role === "recruiter") {
    //     const recruiter = await prisma.recruiter.findUnique({
    //         where: { representativeId: userCtx.userId }
    //     });
    //
    //     if (!recruiter) return false;
    //
    //     // Find drives by this recruiter
    //     const drives = await prisma.drive.findMany({
    //         where: { recruiterId: recruiter.recruiterId }
    //     });
    //
    //     // Find applications to these drives
    //     const applications = await prisma.application.findMany({
    //         where: {
    //             driveId: { in: drives.map(d => d.driveId) },
    //             studentId: targetId
    //         }
    //     });
    //
    //     return applications.length > 0;
    // }

    return false;
}

// Authorization middleware
export function authorize<Res extends Resource>(
    action: Action,
    resource: Res,
    extractId?: (req: Request) => string
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user) {
            throw new UnauthorizedError("Unauthorized");
        }

        const roleRules = policies[user.role]?.[resource];
        const policyFn = roleRules?.[action] as PolicyFn<Res> | undefined;
        if (!policyFn) {
            throw new ForbiddenError("Forbidden");
        }

        let record: ResourceMap[Res] | undefined;
        let resourceId: string | undefined;

        if (extractId) {
            resourceId = extractId(req);

            switch (resource) {
                case "Student": {
                    const where: Prisma.StudentWhereUniqueInput = {
                        studentId: resourceId,
                    };
                    const result = await prisma.student.findUnique({ where });
                    if (result) record = result as ResourceMap[Res];
                    break;
                }
                case "PlacementCell": {
                    const where: Prisma.PlacementCellWhereUniqueInput = {
                        placementCellId: resourceId,
                    };
                    const result = await prisma.placementCell.findUnique({
                        where,
                    });
                    if (result) record = result as ResourceMap[Res];
                    break;
                }
                case "Recruiter": {
                    const where: Prisma.RecruiterWhereUniqueInput = {
                        recruiterId: resourceId,
                    };
                    const result = await prisma.recruiter.findUnique({ where });
                    if (result) record = result as ResourceMap[Res];
                    break;
                }
            }

            if (!record) {
                throw new NotFoundError();
            }
        }

        // Create lookup function for related resources
        const getRelatedResource = await createResourceLookup(user);

        // Create policy context
        const context: PolicyContext<Res> = {
            user,
            resource: record,
            resourceId,
            attrs: req.body as Partial<ResourceMap[Res]>,
            getRelatedResource,
        };

        const allowed = await policyFn(context);
        if (!allowed) {
            throw new ForbiddenError("Forbidden");
        }
        next();
    };
}

// Helper predicates - updated to use the new context object
export const ownStudent: PolicyFn<"Student"> = ({ user, resource }) =>
    user.role === "student" && resource?.studentId === user.userId;

export const updateOwnStudent: PolicyFn<"Student"> = ({ user, resource }) =>
    user.role === "student" && resource?.studentId === user.userId;

export const inCell: PolicyFn<"Student"> = ({ user, resource }) =>
    user.role === "placement_cell" &&
    resource?.placementCellId === user.placementCellId;

export const ownRecruiter: PolicyFn<"Recruiter"> = ({ user, resource }) =>
    user.role === "recruiter" && resource?.representativeId === user.userId;

export const studentCanViewPlacementCell: PolicyFn<"PlacementCell"> = async ({
    user,
    resource,
    getRelatedResource,
}) => {
    if (user.role !== "student") return false;

    if (resource) {
        const student = await getRelatedResource("Student", user.userId);
        return student?.placementCellId === resource.placementCellId;
    }

    return true;
};

// Example of a complex policy that resolves relationships through multiple tables
export const recruiterCanViewStudentApplications: PolicyFn<"Student"> = async ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resource,
}) => {
    // This implementation is a placeholder to be replaced with actual logic when needed
    // The code for complex relationship verification will go here
    return false;
};

// Type definitions for student attributes that can be updated
type StudentAttrs = Partial<
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

// Helper function to validate student update attributes
function validateStudentUpdate(
    attrs: StudentAttrs | undefined,
    isVerified: boolean,
    isPlacementCell: boolean
): boolean {
    if (!attrs) return false;

    const keys = Object.keys(attrs) as (keyof StudentAttrs)[];

    if (isPlacementCell) {
        // Placement cell can update all fields
        return true;
    }

    if (isVerified) {
        // Verified students can only update resumeUrl
        return keys.length === 1 && keys[0] === "resumeUrl";
    }

    // Unverified students can only update specific fields
    const allowedFields = [
        "fullName",
        "cgpa",
        "bachelorsGpa",
        "tenthPercentage",
        "twelfthPercentage",
        "diplomaPercentage",
        "backlogs",
        "liveBacklogs",
        "resumeUrl",
    ];

    return keys.every((key) => allowedFields.includes(key));
}

// Register policies at startup
definePolicy("student", {
    Student: {
        read: ownStudent,
        update: async (context) => {
            const { user, resource, attrs } = context;

            // Students can only update their own profile
            if (!ownStudent(context)) return false;

            // Validate the update attributes based on verification status
            return validateStudentUpdate(
                attrs,
                resource?.isVerifiedByPlacementCell ?? false,
                false
            );
        },
        delete: () => false,
    },
    PlacementCell: {
        read: studentCanViewPlacementCell,
    },
});

export const placementCellCanUpdateOwnDetails: PolicyFn<
    "PlacementCell"
> = async ({ user, resource, attrs }) => {
    if (user.role !== "placement_cell") return false;

    if (resource?.adminId !== user.userId) return false;

    // Check for restricted fields
    if (attrs) {
        const restrictedFields = ["branchId", "adminId", "isVerified"];
        const keys = Object.keys(attrs);

        // If any restricted field is being updated, deny access
        if (restrictedFields.some((field) => keys.includes(field))) {
            return false;
        }
    }

    return true;
};

definePolicy("placement_cell", {
    Student: {
        read: inCell,
        update: async (context) => {
            const { user, resource, attrs } = context;

            // Placement cell can only update students in their cell
            if (!inCell(context)) return false;

            // Validate the update attributes
            return validateStudentUpdate(
                attrs,
                resource?.isVerifiedByPlacementCell ?? false,
                true
            );
        },
        delete: inCell,
    },
    PlacementCell: {
        read: ({ user, resource }) =>
            user.role === "placement_cell" && resource?.adminId === user.userId,
        update: placementCellCanUpdateOwnDetails,
        delete: ({ user, resource }) =>
            user.role === "placement_cell" && resource?.adminId === user.userId,
    },
});

definePolicy("recruiter", {
    Recruiter: {
        create: () => true,
        read: ownRecruiter,
        update: ownRecruiter,
        delete: ownRecruiter,
    },
    // Example of how to add policies for viewing students who have applied
    Student: {
        read: recruiterCanViewStudentApplications,
    },
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: UserContext; // Add the user property
        }
    }
}

// ensure this file is a module for declaration merging
export {};
