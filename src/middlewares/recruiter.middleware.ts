import { authorize } from "../auth/policyHelpers";

export const authorizeRecruiter = authorize(
    "read",
    "Recruiter",
    (req) => req.params.id
);
