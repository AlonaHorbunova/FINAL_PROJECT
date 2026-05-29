import { Router } from "express";
// Выносим RequestHandler в type-импорт, как просит линтер
import type { RequestHandler } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadFoto.js";
import {
  getMe,
  getUserById,
  updateProfile,
  followUser,
  searchUsers,
} from "../controllers/user.controller.js";

const router = Router();

// 1. Получить профиль текущего юзера
router.get("/me", authMiddleware as RequestHandler, getMe as RequestHandler);

//  2. РОУТ ДЛЯ ПОИСКА
router.get(
  "/search",
  authMiddleware as RequestHandler,
  searchUsers as RequestHandler,
);

// 3. Подписка на пользователя
router.post(
  "/follow/:id",
  authMiddleware as RequestHandler,
  followUser as RequestHandler,
);

// 4. Обновление профиля и аватарки
router.put(
  "/update",
  authMiddleware as RequestHandler,
  upload.single("avatar") as RequestHandler,
  updateProfile as RequestHandler,
);

// 5. Получить данные чужого профиля по ID (стоит в самом низу)
router.get(
  "/:id",
  authMiddleware as RequestHandler,
  getUserById as RequestHandler,
);

export default router;
