import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addComment } from "../controllers/comment.controller.js";
import type { RequestHandler } from "express";

const router = Router();

router.post("/:postId", authMiddleware as RequestHandler, addComment);

export default router;
