import { Router } from "express";
import {
    getPlacementCellController,
    updatePlacementCellController,
    deletePlacementCellController,
    getStudentPlacementCellController,
} from "../controllers/placementCell.controller";
import {
    authorizePlacementCellRead,
    authorizePlacementCellUpdate,
    authorizePlacementCellDelete,
} from "../middlewares/placementCell.middleware";
import { authGuard } from "../auth/auth.guard";

const router = Router();

router.get(
    "/:id",
    authGuard,
    authorizePlacementCellRead,
    getPlacementCellController
);
router.put(
    "/:id",
    authGuard,
    authorizePlacementCellUpdate,
    updatePlacementCellController
);
router.delete(
    "/:id",
    authGuard,
    authorizePlacementCellDelete,
    deletePlacementCellController
);

router.get(
    "/student/placement-cell",
    authGuard,
    getStudentPlacementCellController
);

export default router;
