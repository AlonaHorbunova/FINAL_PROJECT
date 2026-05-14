import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addComment } from "../controllers/comment.controller.js";

const router = Router();

// Теперь маршрут активен и принимает postId
router.post("/:postId", authMiddleware, addComment);

export default router;
