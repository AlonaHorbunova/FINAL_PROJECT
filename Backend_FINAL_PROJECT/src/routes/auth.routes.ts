import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // Исправлено имя

const router = Router();

// Регистрация: POST /api/auth/register
router.post("/register", register);

// Вход: POST /api/auth/login
router.post("/login", login);

// Получение данных о себе: GET /api/auth/me
// Используем authMiddleware для проверки токена
router.get("/me", authMiddleware, getMe);

export default router;
