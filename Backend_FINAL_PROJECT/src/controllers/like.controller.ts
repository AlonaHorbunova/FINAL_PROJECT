import type { Request, Response, NextFunction } from "express";
import { Like } from "../db/models/Like.js";
import { Post } from "../db/models/Post.js";
import { CustomError } from "../utils/CustomError.js";
import { sendNotification } from "../utils/sendNotification.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const toggleLike = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    
    const postId = authReq.params.postId as string;
    const userId = authReq.user?.id as string;

    if (!userId) {
      throw new CustomError("Пользователь не авторизован", 401);
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Пост не найден", 404);
    }

    const filter = { user: userId, post: postId };
    const existingLike = await Like.findOne(filter);

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      res.json({ message: "Лайк удален", liked: false });
      return;
    } else {
      const newLike = new Like(filter);
      await newLike.save();

      
      if (post && post.author && post.author.toString() !== userId) {
        await sendNotification({
          receiver: post.author.toString(),
          issuer: userId,
          type: "like",
          post: postId,
        });
      }

      res.status(201).json({ message: "Лайк поставлен", liked: true });
      return;
    }
  } catch (error) {
    next(error);
  }
};
