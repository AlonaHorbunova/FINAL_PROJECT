import { Router } from "express";
import type { RequestHandler } from "express"; // Импортируем тип отдельно
import { getAllPosts, createPost } from "../controllers/posts.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadFoto.js";

const router = Router();

// Маршрут для получения всех постов (доступен всем)
router.get("/", getAllPosts as unknown as RequestHandler);

// Маршрут для создания поста
router.post(
  "/",
  authMiddleware as unknown as RequestHandler,
  upload.single("image") as unknown as RequestHandler,
  createPost as unknown as RequestHandler,
);

export default router;
