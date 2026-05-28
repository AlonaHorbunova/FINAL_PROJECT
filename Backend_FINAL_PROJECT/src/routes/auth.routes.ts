import { Router } from "express";
import type { RequestHandler } from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword, // 1. ДОБАВЬ ИМПОРТ ЭТОЙ ФУНКЦИИ ИЗ КОНТРОЛЛЕРА
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword as RequestHandler);

// 2. ДОБАВЬ ЭТОТ РОУТ (Именно сюда фронтенд будет слать новый пароль)
// Обрати внимание: если в твоем redux-экшене путь "/reset/:token", то и тут напиши "/reset/:token"
router.post("/reset-password/:token", resetPassword as RequestHandler); 

router.get("/me", authMiddleware as RequestHandler, getMe as RequestHandler);

export default router;