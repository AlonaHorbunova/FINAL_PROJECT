import type { Request, Response, NextFunction } from "express";
import { Comment } from "../db/models/Comment.js";
import { Post } from "../db/models/Post.js";
import { Notification } from "../db/models/Notification.js";
import { Server } from "socket.io";
import { Types } from "mongoose";

// Расширяем интерфейс
interface AuthRequest extends Request {
  user?: { id: string };
}

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId } = req.params;
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { text } = req.body;

    // 1. Проверяем наличие ID и текста
    if (!userId || !postId) {
      return res
        .status(401)
        .json({ message: "Недостаточно данных для комментария" });
    }

    // 2. Ищем пост
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }

    // Здесь используем 'author' и приводим к любому типу, чтобы взять ID строкой
    const postAuthorId = (post as any).author.toString();

    // 3. Создаем комментарий (userId as string — это "успокоительное" для TS)
    const comment = await Comment.create({
      user: new Types.ObjectId(userId as string),
      post: new Types.ObjectId(postId as string),
      text,
    });

    // 4. Логика уведомлений
    if (postAuthorId !== userId) {
      await Notification.create({
        receiver: new Types.ObjectId(postAuthorId as string),
        issuer: new Types.ObjectId(userId as string),
        type: "comment",
        post: new Types.ObjectId(postId as string),
      });

      const io = req.app.get("io") as Server;
      if (io) {
        io.to(postAuthorId).emit("notification", {
          message: "Новый комментарий!",
        });
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};
