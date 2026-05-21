import { Router } from "express";
import type { RequestHandler } from "express";
import {
  sendMessage,
  getChatMessages,
} from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getUnreadCount } from "../controllers/message.controller.js";
import { markAsRead } from "../controllers/message.controller.js";

const router = Router();

// Приводим к типу RequestHandler, чтобы Express не ругался на несовпадение Request/AuthRequest
router.use(authMiddleware as unknown as RequestHandler);

router.post("/", sendMessage as unknown as RequestHandler);
router.get("/:chatId", getChatMessages as unknown as RequestHandler);
router.get(
  "/unread-count",
  authMiddleware as unknown as RequestHandler,
  getUnreadCount,
);
router.patch(
  "/mark-read/:chatId",
  authMiddleware as unknown as RequestHandler,
  markAsRead,
);

export default router;
