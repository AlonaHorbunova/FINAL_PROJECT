import { Router } from "express";
import type { RequestHandler } from "express";
import {
  sendMessage,
  getChatMessages,
  getConversations,
  getUnreadCount,
  markAsRead,
} from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Глобально защищаем все роуты сообщений одной мидлварой
router.use(authMiddleware as unknown as RequestHandler);

// Статические роуты пишем строго НАВЕРХУ
router.post("/", sendMessage as unknown as RequestHandler);
router.get("/conversations", getConversations as unknown as RequestHandler);
router.get("/unread-count", getUnreadCount as unknown as RequestHandler);

// Роуты с динамическими параметрами (:) переносим в самый КОНЕЦ
router.patch("/mark-read/:chatId", markAsRead as unknown as RequestHandler);
router.get("/:chatId", getChatMessages as unknown as RequestHandler);

export default router;
