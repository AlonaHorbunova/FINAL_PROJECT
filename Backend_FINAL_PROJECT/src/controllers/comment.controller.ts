import type { Request, Response, NextFunction } from "express";
import { Comment } from "../db/models/Comment.js";
import { Post } from "../db/models/Post.js";
import { sendNotification } from "../utils/sendNotification.js";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    // 🔥 Строго фиксируем строки
    const postId = authReq.params.postId as string;
    const userId = authReq.user?.id as string;
    const { text } = req.body;

    if (!userId || !postId) {
      res.status(401).json({ message: "Недостаточно данных для комментария" });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Пост не найден" });
      return;
    }

    const postAuthorId = (post as any).author.toString();

    // Mongoose сам превратит эти строки в ObjectId на основе схемы Comment
    const comment = await Comment.create({
      user: userId,
      post: postId,
      text,
    });

    // Живое уведомление через утилиту
    if (postAuthorId !== userId) {
      await sendNotification({
        receiver: postAuthorId,
        issuer: userId,
        type: "comment",
        post: postId,
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};
