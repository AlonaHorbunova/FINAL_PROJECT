import { Router } from "express";
import type { RequestHandler } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // Исправлено имя

const router = Router();

// Регистрация: POST /api/auth/register
router.post("/register", register);

// Вход: POST /api/auth/login
router.post("/login", login);

router.get("/me", authMiddleware as RequestHandler, getMe as RequestHandler);

export default router;
