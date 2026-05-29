import { Router } from "express";
import { toggleLike } from "../controllers/like.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import type { RequestHandler } from "express";

const router = Router();

// Маршрут: POST /api/likes/64abc123...
router.post("/:postId", authMiddleware as RequestHandler, toggleLike);

export default router;
