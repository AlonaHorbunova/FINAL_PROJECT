import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
// Здесь позже импортируем контроллеры комментариев

const router = Router();

// Маршрут для создания комментария будет примерно таким:
// router.post("/:postId", authMiddleware, createComment);

export default router;
