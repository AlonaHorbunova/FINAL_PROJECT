import { Router } from "express";
import { getAllPosts, createPost } from "../controllers/posts.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadFoto.js";

const router = Router();

// Маршрут для получения всех постов (доступен всем)
router.get("/", getAllPosts);

// Маршрут для создания поста (только для авторизованных + загрузка фото)
// "image" — это имя поля, которое ты будешь использовать в Postman (form-data)
router.post(
  "/",
  authMiddleware as any,
  upload.single("image") as any,
  createPost,
);

export default router;
