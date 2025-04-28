import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import {
  PlacementCellProfileData,
  RecruiterProfileData,
  RegisterInput,
  StudentProfileData,
} from "../types/auth.types";
import { ValidationError } from "../utils/error";

export const validateUsernameAndEmail = async (
  username: string,
  email: string
) => {
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
  const { username, email, role, password } = userData;
  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const processedData: ProcessedRegisterInput = {
    ...userData,
    password: hashedPassword,
  };

  await validateUsernameAndEmail(username, email);

  switch (role) {
    case "student":
      const { studentProfileData } = userData;
      await registerStudent({
        ...processedData,
        role: "student",
        studentProfileData,
      });
      break;
    case "placement_cell":
      const { placementCellProfileData } = userData;
      await registerPlacementCell({
        ...processedData,
        role: "placement_cell",
        placementCellProfileData,
      });
      break;
    case "recruiter":
      const { recruiterProfileData } = userData;
      await registerRecruiter({
        ...processedData,
        role: "recruiter",
        recruiterProfileData,
      });
      break;
  }
};

const validateStudentData = async (studentData: {
  placementCellId: string;
  degreeId: string;
  email: string;
}) => {
  const { placementCellId, degreeId, email } = studentData;
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
      placementCellId: "provided PlacementCell id is Invalid",
    });
  }

  const studentDomain = "@" + email.split("@")[1];

  const domainAllowed = placementCell.placementCellDomains.some(
    (placementCellDomain) => placementCellDomain.domain === studentDomain
  );

  if (!domainAllowed) {
    throw new ValidationError({
      email: "Student's email domain is not allowed for this placement cell.",
    });
  }

  const hasDegree = placementCell.placementCellDegrees.some(
    (placementCellDegree) => placementCellDegree.degree.degreeId === degreeId
  );

  if (!hasDegree) {
    throw new ValidationError({
      degree: "Student's degree is not allowed for this placement cell.",
    });
  }
};

const validatePlacementCellData = async (
  placementCellBranch: string,
  placementCellDegrees: string[]
) => {
  let branch = await prisma.branch.findUnique({
    where: { name: placementCellBranch },
  });
  if (!branch) {
    branch = await prisma.branch.create({
      data: { name: placementCellBranch },
    });
  }

  const dbDegrees: { degreeId: string; name: string }[] = [];

  for (const degreeName of placementCellDegrees) {
    let degree = await prisma.degree.findUnique({
      where: { name: degreeName },
    });

    if (!degree) {
      degree = await prisma.degree.create({
        data: { name: degreeName },
      });
    }
    dbDegrees.push({ degreeId: degree.degreeId, name: degree.name });
  }
  return { branch, degrees: dbDegrees };
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
  await validateStudentData({ placementCellId, degreeId: degreeId, email });
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
  let { name, domains, branchName, degreeNames, website } =
    placementCellProfileData;

  const { branch, degrees } = await validatePlacementCellData(
    branchName,
    degreeNames
  );
  console.log({ degrees }, { branch });

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
        name,
        branchId: branch.branchId,
        email,
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
        data: degrees.map((degree) => ({
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
  const { companyName, representativePosition, description, website } =
    recruiterProfileData;

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
      },
    });

    return { user, recruiterProfile };
  });

  return result;
};
