import { Router } from "express";
import {
    getPlacementCellController,
    updatePlacementCellController,
    deletePlacementCellController,
    getStudentPlacementCellController,
} from "../controllers/placementCell.controller";
import { authorizePlacementCell } from "../middlewares/placementCell.middleware";
import { authGuard } from "../auth/auth.guard";

const router = Router();

router.get("/:id", authGuard, getPlacementCellController);
router.patch(
    "/:id",
    authGuard,
    authorizePlacementCell,
    updatePlacementCellController
);
router.delete(
    "/:id",
    authGuard,
    authorizePlacementCell,
    deletePlacementCellController
);

router.get(
    "/student/placement-cell",
    authGuard,
    getStudentPlacementCellController
);

export default router;
