import { Router } from "express";
import {
    getStudentController,
    getStudentsController,
    updateStudentController,
    deleteStudentController,
    batchVerifyStudentsController,
} from "../controllers/student.controller";
import {
    authorizeStudent,
    authorizeStudentUpdate,
    authorizeStudentDeletion,
} from "../middlewares/student.middleware";
import { authGuard } from "../auth/auth.guard";

const router = Router();

router.get("/:id", authGuard, authorizeStudent, getStudentController);
router.get("/", authGuard, getStudentsController);
router.put("/:id", authGuard, authorizeStudentUpdate, updateStudentController);
router.delete(
    "/:id",
    authGuard,
    authorizeStudentDeletion,
    deleteStudentController
);
router.post("/batch-verify", authGuard, batchVerifyStudentsController);

export default router;
