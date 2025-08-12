import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

//AUTH
router.post("/register", register);
router.post("/login", login);

export default router;
