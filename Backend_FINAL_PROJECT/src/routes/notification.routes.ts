import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getMyNotifications } from "../controllers/notification.controller.js";

const router = Router();

// Получить все уведомления для залогиненного юзера
router.get("/", authMiddleware, getMyNotifications);

export default router;
