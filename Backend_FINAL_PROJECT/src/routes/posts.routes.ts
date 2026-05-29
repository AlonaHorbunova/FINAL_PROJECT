import { Router } from "express";
import type { RequestHandler } from "express"; // Импортируем тип отдельно
import {
  getAllPosts,
  createPost,
  deletePost,
} from "../controllers/posts.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadFoto.js";
import { getRandomPosts } from "../controllers/posts.controller.js";

const router = Router();

router.get("/", getAllPosts as unknown as RequestHandler);
router.get("/random", getRandomPosts);

router.post(
  "/",
  authMiddleware as unknown as RequestHandler,
  upload.single("image") as unknown as RequestHandler,
  createPost as unknown as RequestHandler,
);
router.delete(
  "/:postId",
  authMiddleware as unknown as RequestHandler,
  deletePost as unknown as RequestHandler,
);

export default router;
