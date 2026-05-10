import { Router } from "express";
import { toggleLike } from "../controllers/like.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Маршрут: POST /api/likes/64abc123...
router.post("/:postId", authMiddleware, toggleLike);

export default router;
