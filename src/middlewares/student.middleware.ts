import { authorize } from "../auth/policyHelpers";

export const authorizeStudent = authorize(
    "read",
    "Student",
    (req) => req.params.id
);

export const authorizeStudentUpdate = authorize(
    "update",
    "Student",
    (req) => req.params.id
);

export const authorizeStudentDeletion = authorize(
    "delete",
    "Student",
    (req) => req.params.id
);
