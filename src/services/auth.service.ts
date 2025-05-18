import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import jwt from "jsonwebtoken";
import { ResponseHandler } from "../utils/apiResponse";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import {
    AuthResponse,
    PlacementCellProfileData,
    RecruiterProfileData,
    RegisterInput,
    StudentProfileData,
} from "../types";
import { ValidationError } from "../errors/ValidationError";
import { Response } from "express"; // Ensure this is imported

export const validateUserData = async (username: string, email: string, password: string, confirmPassword: string) => {

    if(password !== confirmPassword){
        throw new ValidationError({
            confirmPassword: "Passwords do not match"
        });
    }
    
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }],
        },
    });

    const errorDetails: Record<string, string> = {};
    if (existingUser?.email === email) {
        errorDetails.email = "Email already exists";
    }

    if (existingUser?.username === username) {
        errorDetails.username = "Username already exists";
    }

    if (Object.keys(errorDetails).length > 0) {
        throw new ValidationError(errorDetails);
    }
};

type ProcessedRegisterInput = Omit<RegisterInput, "password"> & {
    password: string;
};

export const registerUser = async (userData: RegisterInput) => {
    const { username, email, role, password, confirmPassword} = userData;
    await validateUserData(username, email, password, confirmPassword);
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const processedData: ProcessedRegisterInput = {
        ...userData,
        password: hashedPassword,
    };


    switch (role) {
        case "student": {
            const { studentProfileData } = userData;
            await registerStudent({
                ...processedData,
                role: "student",
                studentProfileData,
            });
            break;
        }
        case "placement_cell": {
            const { placementCellProfileData } = userData;
            await registerPlacementCell({
                ...processedData,
                role: "placement_cell",
                placementCellProfileData,
            });
            break;
        }
        case "recruiter": {
            const { recruiterProfileData } = userData;
            await registerRecruiter({
                ...processedData,
                role: "recruiter",
                recruiterProfileData,
            });
            break;
        }
    }
};

const validateStudentData = async (studentData: {
    placementCellId: string;
    degreeId: string;
    email: string;
    enrollmentNumber: string;
}) => {
    const { placementCellId, degreeId, email, enrollmentNumber } = studentData;

    if (!email.includes("@")) {
        throw new ValidationError({
            email: "Invalid email format.",
        });
    }

    const placementCell = await prisma.placementCell.findUnique({
        where: { placementCellId },
        include: {
            placementCellDegrees: {
                include: { degree: true },
            },
            placementCellDomains: true,
        },
    });

    if (!placementCell) {
        throw new ValidationError({
            placementCellId: "Provided PlacementCell ID is invalid.",
        });
    }

    const studentDomain = "@" + email.split("@")[1];

    const student = await prisma.student.findFirst({
        where: {
            placementCellId: placementCellId,
            enrollmentNumber: enrollmentNumber,
        },
    });

    if (student) {
        throw new ValidationError({
            enrollmentNumber:
                "Enrollment number already exists for this placement cell.",
        });
    }

    const domainAllowed = placementCell.placementCellDomains.some(
        (placementCellDomain) => {console.log(placementCellDomain.domain, studentDomain);return placementCellDomain.domain === studentDomain}
    );

    if (!domainAllowed) {
        throw new ValidationError({
            email: "Student's email domain is not allowed for this placement cell.",
        });
    }

    const hasDegree = placementCell.placementCellDegrees.some(
        (placementCellDegree) =>
            placementCellDegree.degree.degreeId === degreeId
    );

    if (!hasDegree) {
        throw new ValidationError({
            degree: "Student's degree is not allowed for this placement cell.",
        });
    }
};

const validatePlacementCellData = async (
    placementCellName: string,
    placementCellBranch: string,
    placementCellDegrees: string[]
) => {
    const placementCell = await prisma.placementCell.findUnique({
        where: { placementCellName },
    });

    if (placementCell) {
        throw new ValidationError({
            placementCellName: "Placement cell name is taken",
        });
    }

    let dbBranch = await prisma.branch.findUnique({
        where: { branchId: placementCellBranch },
    });

    if (!dbBranch) {
        throw new ValidationError({
            placementCellBranch: `Branch '${placementCellBranch}' does not exist`,
        });
    }

    const dbDegrees: { degreeId: string; name: string }[] = [];

    for (const degreeName of placementCellDegrees) {
        let degree = await prisma.degree.findUnique({
            where: { degreeId: degreeName },
        });

        if (!degree) {
            throw new ValidationError({
                placementCellDegrees: `Degree '${degreeName}' does not exist`,
            });
        }

        dbDegrees.push(degree);
    }

    return { dbBranch, dbDegrees };
};

const registerStudent = async (
    studentData: ProcessedRegisterInput & {
        role: "student";
        studentProfileData: StudentProfileData;
    }
) => {
    const { email, password, username, studentProfileData } = studentData;
    const { placementCellId, degreeId, enrollmentNumber, fullName } =
        studentProfileData;
    await validateStudentData({
        placementCellId,
        degreeId: degreeId,
        email,
        enrollmentNumber,
    });
    const createdStudent = await prisma.$transaction(async (tx) => {
        // Step 3.1: Create User
        const user = await tx.user.create({
            data: {
                email,
                password,
                username,
                role: "student",
            },
        });

        // Step 3.2: Create Student linked to User
        const student = await tx.student.create({
            data: {
                studentId: user.userId,
                enrollmentNumber,
                placementCellId,
                degreeId,
                fullName,
            },
        });

        return { user, student };
    });

    // Step 4: Return created user and student details (or success response)
    return {
        message: "Student registered successfully",
        user: {
            id: createdStudent.user.userId,
            email: createdStudent.user.email,
            role: createdStudent.user.role,
        },
        student: {
            studentId: createdStudent.student.studentId,
            enrollmentNumber: createdStudent.student.enrollmentNumber,
            placementCellId: createdStudent.student.placementCellId,
            degreeId: createdStudent.student.degreeId,
        },
    };
};

const registerPlacementCell = async (
    placementCellData: ProcessedRegisterInput & {
        role: "placement_cell";
        placementCellProfileData: PlacementCellProfileData;
    }
) => {
    const { email, username, password, placementCellProfileData } =
        placementCellData;
    const {
        placementCellName,
        domains,
        branchId,
        degrees,
        website,
        placementCellEmail,
    } = placementCellProfileData;

    const { dbBranch, dbDegrees } = await validatePlacementCellData(
        placementCellName,
        branchId,
        degrees
    );

    const result = await prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password,
                role: "placement_cell",
            },
        });

        const placementCell = await prisma.placementCell.create({
            data: {
                adminId: user.userId,
                placementCellName,
                branchId: dbBranch.branchId,
                placementCellEmail,
                website,
            },
        });

        await prisma.placementCellDomain.createMany({
            data: domains.map((domain) => ({
                placementCellId: placementCell.placementCellId,
                domain,
            })),
        });

        if (degrees.length > 0) {
            await prisma.placementCellDegree.createMany({
                data: dbDegrees.map((degree) => ({
                    placementCellId: placementCell.placementCellId,
                    degreeId: degree.degreeId,
                })),
            });
        }

        return { user, placementCell };
    });
    return result;
};

const registerRecruiter = async (
    recruiterData: ProcessedRegisterInput & {
        role: "recruiter";
        recruiterProfileData: RecruiterProfileData;
    }
) => {
    const { email, username, password, recruiterProfileData } = recruiterData;
    const {
        companyName,
        representativePosition,
        description,
        website,
        companyEmail,
    } = recruiterProfileData;

    // Check if the company name already exists
    const existingRecruiter = await prisma.recruiter.findUnique({
        where: { companyName },
    });

    if (existingRecruiter) {
        throw new ValidationError({
            companyName: "Company name already exists.",
        });
    }

    const result = await prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password,
                role: "recruiter",
            },
        });

        const recruiterProfile = await prisma.recruiter.create({
            data: {
                representativeId: user.userId,
                companyName,
                representativePosition,
                description,
                website,
                companyEmail,
            },
        });

        return { user, recruiterProfile };
    });

    return result;
};

interface TokenPayload {
    type: string;
    userId: string;
    email: string;
    role: string;
    studentId?: string;
    placementCellId?: string;
    recruiterId?: string;
}

export const login = async (email: string, password: string, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new UnauthorizedError("Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password.");
    }

    const roleSpecificData: Partial<AuthResponse["user"]> = {};

    if (user.role === "student") {
        const student = await prisma.student.findUnique({
            where: { studentId: user.userId },
        });
        if (student) {
            roleSpecificData.studentId = student.studentId;
        }
    } else if (user.role === "placement_cell") {
        const placementCell = await prisma.placementCell.findUnique({
            where: { adminId: user.userId },
        });
        if (placementCell) {
            roleSpecificData.placementCellId = placementCell.placementCellId;
        }
    } else if (user.role === "recruiter") {
        const recruiter = await prisma.recruiter.findUnique({
            where: { representativeId: user.userId },
        });
        if (recruiter) {
            roleSpecificData.recruiterId = recruiter.recruiterId;
        }
    }

    const tokenPayload: TokenPayload = {
        type: "access",
        userId: user.userId,
        email: user.email,
        role: user.role,
        ...roleSpecificData,
    };

    const token = jwt.sign(
        tokenPayload,
        process.env.TOKEN_KEY || "secret-key",
        { expiresIn: "24h" }
    );

    // Step 5: Create a response
    const responseData: AuthResponse = {
        token,
        user: {
            userId: user.userId,
            email: user.email,
            role: user.role,
            ...roleSpecificData, // Add the relevant IDs based on the role
        },
    };

    // Step 6: Send the response
    ResponseHandler.success(res, responseData, "Login successful.");
};
