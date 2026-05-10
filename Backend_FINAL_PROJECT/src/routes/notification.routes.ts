import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
// Здесь позже импортируем контроллеры уведомлений

const router = Router();

// Получить все уведомления для залогиненного юзера
// router.get("/", authMiddleware, getNotifications);

export default router;
