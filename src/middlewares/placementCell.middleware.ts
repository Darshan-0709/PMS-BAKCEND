import { authorize } from "../auth/policyHelpers";

export const authorizePlacementCellRead = authorize(
    "read",
    "PlacementCell",
    (req) => req.params.id
);

export const authorizePlacementCellUpdate = authorize(
    "update",
    "PlacementCell",
    (req) => req.params.id
);

export const authorizePlacementCellDelete = authorize(
    "delete",
    "PlacementCell",
    (req) => req.params.id
);

// Backwards compatibility alias
export const authorizePlacementCell = authorizePlacementCellUpdate;
