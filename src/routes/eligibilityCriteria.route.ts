import { Router } from "express";
import {
    createEligibilityCriteriaController,
    getEligibilityCriteriaController,
    getAllEligibilityCriteriaController,
    updateEligibilityCriteriaController,
    deleteEligibilityCriteriaController,
} from "../controllers/eligibilityCriteria.controller";
import {
    authorizeEligibilityCriteriaCreate,
    authorizeEligibilityCriteriaRead,
    authorizeEligibilityCriteriaUpdate,
    authorizeEligibilityCriteriaDelete,
} from "../middlewares/eligibilityCriteria.middleware";
import { authGuard } from "../auth/auth.guard";

const router = Router();

// Create eligibility criteria
router.post(
    "/",
    authGuard,
    authorizeEligibilityCriteriaCreate,
    createEligibilityCriteriaController
);

// Get all eligibility criteria for recruiter
router.get("/", authGuard, getAllEligibilityCriteriaController);

// Get eligibility criteria by ID
router.get(
    "/:id",
    authGuard,
    authorizeEligibilityCriteriaRead,
    getEligibilityCriteriaController
);

// Update eligibility criteria
router.put(
    "/:id",
    authGuard,
    authorizeEligibilityCriteriaUpdate,
    updateEligibilityCriteriaController
);

// Delete eligibility criteria
router.delete(
    "/:id",
    authGuard,
    authorizeEligibilityCriteriaDelete,
    deleteEligibilityCriteriaController
);

export default router;
