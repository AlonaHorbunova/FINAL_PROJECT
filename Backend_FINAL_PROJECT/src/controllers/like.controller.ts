import type { Request, Response, NextFunction } from "express";
import { Like } from "../db/models/Like.js";
import { Post } from "../db/models/Post.js";
import { CustomError } from "../utils/CustomError.js";
import { Notification } from "../db/models/Notification.js";
import { Types } from "mongoose";

// Создаем строгий интерфейс для запроса с пользователем
interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const toggleLike = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    // 1. Проверяем авторизацию
    if (!userId) {
      throw new CustomError("Пользователь не авторизован", 401);
    }

    // 2. Проверяем существование поста
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Пост не найден", 404);
    }

    // 3. Ищем лайк (используем строки, Mongoose сам конвертирует их в ObjectId)
    const filter = {
      user: userId,
      post: postId,
    };

    const existingLike = await Like.findOne(filter);

    if (existingLike) {
      // Если лайк есть — удаляем его (Un-like)
      await Like.deleteOne({ _id: existingLike._id });

      return res.json({
        message: "Лайк удален",
        liked: false,
      });
    } else {
      // Если лайка нет — создаем новый
      const newLike = new Like(filter);
      await newLike.save();

      // ЛОГИКА УВЕДОМЛЕНИЯ
      // Проверяем, что лайк ставит НЕ автор поста самому себе
      if (post && post.author && userId) {
        if (post.author.toString() !== userId) {
          await Notification.create({
            receiver: post.author,
            issuer: new Types.ObjectId(userId as string), // Явно говорим, что это строка
            type: "like",
            post: new Types.ObjectId(postId as string), // Явно говорим, что это строка
          });
        }
      }
      return res.status(201).json({
        message: "Лайк поставлен",
        liked: true,
      });
    }
  } catch (error) {
    next(error);
  }
};
