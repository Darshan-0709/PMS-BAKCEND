import { Request, Response, Router } from "express";
import { register, validateUserInput } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.get("/login", (req: Request, res: Response) => {
  res.status(200).json({ message: "Login" });
});

router.post("/validate-user", validateUserInput);

export default router;
