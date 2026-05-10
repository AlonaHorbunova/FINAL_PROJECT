import type { Request, Response, NextFunction } from "express";
import { Like } from "../db/models/Like.js";
import { Post } from "../db/models/Post.js";
import { Notification } from "../db/models/Notification.js";
import { CustomError } from "../utils/CustomError.js";
import { Types } from "mongoose";
import { Server } from "socket.io";

export const toggleLike = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId } = req.params;

    // 1. Берем данные пользователя через unknown (безопасно)
    const userContext = req as unknown as {
      user?: { id: string; username: string };
    };
    const userId = userContext.user?.id;
    const username = userContext.user?.username;

    if (!userId) throw new CustomError("Пользователь не авторизован", 401);

    const post = await Post.findById(postId);
    if (!post) throw new CustomError("Пост не найден", 404);

    // 2. Ищем лайк.
    const filter = {
      user: new Types.ObjectId(userId),
      post: new Types.ObjectId(postId),
    };
    const existingLike = await (Like as any).findOne(filter);

    if (existingLike) {
      await (existingLike as any).deleteOne();
      return res.json({ message: "Лайк удален", liked: false });
    }

    // 3. Создаем лайк через any
    await (Like as any).create(filter);

    // Достаем автора поста (проверь, в модели это 'user' или 'author'!)
    const postData = post as any;
    const postAuthorId = postData.user
      ? postData.user.toString()
      : postData.author?.toString();

    // 4. Уведомление
    if (postAuthorId && postAuthorId !== userId) {
      const notificationData = {
        receiver: new Types.ObjectId(postAuthorId),
        issuer: new Types.ObjectId(userId),
        type: "like",
        post: new Types.ObjectId(postId),
      };
      await (Notification as any).create(notificationData);

      // 5. Сокеты
      const io = req.app.get("io") as unknown as Server;
      if (io && typeof io.to === "function") {
        io.to(postAuthorId).emit("notification", {
          message: `${username || "Кто-то"} лайкнул ваш пост!`,
          type: "like",
        });
      }
    }

    res.status(201).json({ message: "Лайк поставлен", liked: true });
  } catch (error) {
    next(error);
  }
};
