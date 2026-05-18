import { Router } from "express";
// Выносим RequestHandler в type-импорт, как просит линтер
import type { RequestHandler } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadFoto.js";
import {
  getMe,
  getUserById,
  updateProfile,
} from "../controllers/user.controller.js";

const router = Router();

// 1. Получить данные своего профиля
router.get("/me", authMiddleware as RequestHandler, getMe as RequestHandler);

// 2. Универсальное обновление профиля (данные + аватарка)
// ВАЖНО: Добавили upload.single("avatar"), чтобы multer ловил файл из формы
router.put(
  "/update",
  authMiddleware as RequestHandler,
  upload.single("avatar") as RequestHandler,
  updateProfile as RequestHandler,
);

// 3. Получить данные чужого профиля по ID
router.get(
  "/:id",
  authMiddleware as RequestHandler,
  getUserById as RequestHandler,
);

export default router;