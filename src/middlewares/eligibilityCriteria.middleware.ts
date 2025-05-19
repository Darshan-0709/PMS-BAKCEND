import { authorize } from "../auth/policyHelpers";

export const authorizeEligibilityCriteriaCreate = authorize(
    "create",
    "EligibilityCriteria"
);

export const authorizeEligibilityCriteriaRead = authorize(
    "read",
    "EligibilityCriteria",
    (req) => req.params.id
);

export const authorizeEligibilityCriteriaUpdate = authorize(
    "update",
    "EligibilityCriteria",
    (req) => req.params.id
);

export const authorizeEligibilityCriteriaDelete = authorize(
    "delete",
    "EligibilityCriteria",
    (req) => req.params.id
);
