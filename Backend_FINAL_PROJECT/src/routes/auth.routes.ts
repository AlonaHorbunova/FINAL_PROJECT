import { Router } from "express";
import type { RequestHandler } from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword as RequestHandler);

router.post("/reset-password/:token", resetPassword as RequestHandler);

router.get("/me", authMiddleware as RequestHandler, getMe as RequestHandler);

export default router;
