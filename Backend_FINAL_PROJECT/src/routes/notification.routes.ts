import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getMyNotifications } from "../controllers/notification.controller.js";
import type { RequestHandler } from "express";

const router = Router();

router.get("/", authMiddleware as RequestHandler, getMyNotifications);

export default router;
