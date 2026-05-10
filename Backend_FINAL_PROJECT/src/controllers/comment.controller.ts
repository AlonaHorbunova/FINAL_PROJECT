import type { Request, Response, NextFunction } from "express";
import { Comment } from "../db/models/Comment.js";
import { Post } from "../db/models/Post.js";
import { Notification } from "../db/models/Notification.js";
import { Server } from "socket.io";
import { Types } from "mongoose";

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    // 1. Убираем any через unknown (профессиональный подход)
    const userContext = req as unknown as { user?: { id: string } };
    const userId = userContext.user?.id;

    if (!userId) throw new Error("Пользователь не авторизован");

    // 2. Ищем пост
    const post = await Post.findById(postId);
    if (!post) throw new Error("Пост не найден");

    const postData = post as unknown as { user: { toString(): string } };

    const comment = await Comment.create({
      user: new Types.ObjectId(userId), // Теперь это ObjectId, а не строка
      post: new Types.ObjectId(postId), // И это тоже
      text,
    });

    const postAuthorId = postData.user.toString();

    // 3. Уведомления и Сокеты
    if (postAuthorId !== userId) {
      await Notification.create({
        receiver: new Types.ObjectId(postAuthorId),
        issuer: new Types.ObjectId(userId),
        type: "comment",
        post: new Types.ObjectId(postId),
      });

      const io = req.app.get("io") as unknown as Server;

      if (io && typeof io.to === "function") {
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
