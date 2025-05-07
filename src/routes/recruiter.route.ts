import { Router } from "express";
import {
    getRecruiterController,
    updateRecruiterController,
    deleteRecruiterController,
} from "../controllers/recruiter.controller";
import { authorizeRecruiter } from "../middlewares/recruiter.middleware";
import { authGuard } from "../auth/auth.guard";

const router = Router();

router.get("/:id", authGuard, authorizeRecruiter, getRecruiterController);
router.patch("/:id", authGuard, authorizeRecruiter, updateRecruiterController);
router.delete("/:id", authGuard, authorizeRecruiter, deleteRecruiterController);

export default router;
