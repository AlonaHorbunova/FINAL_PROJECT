import type { Request, Response, NextFunction } from "express";
import { Post } from "../db/models/Post.js";
import { CustomError } from "../utils/CustomError.js";
import sharp from "sharp"; // Для сжатия
import path from "path";
import fs from "fs";

interface AuthRequest extends Request {
  user?: { id: string };
  file?: any; // Добавляем поддержку файла от multer
}

export const getAllPosts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // В Инстаграме мы хотим видеть не только автора, но и его аватар
    const posts = await Post.find()
      .populate("user", "username avatar")
      .sort({ createdAt: -1 }); // Новые посты сверху
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const createPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { caption } = req.body;

    if (!req.file) {
      throw new CustomError("Изображение обязательно", 400);
    }

    if (!req.user?.id) {
      throw new CustomError("Недостаточно прав", 401);
    }

    // Обработка изображения (делаем его легковесным)
    const fileName = `post-${Date.now()}.webp`;
    const outputPath = path.join("public", "uploads", fileName);

    // Создаем папку, если её нет
    if (!fs.existsSync("public/uploads")) {
      fs.mkdirSync("public/uploads", { recursive: true });
    }

    await sharp(req.file.buffer)
      .resize(1080, 1080, { fit: "inside" })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Создаем пост по твоей НОВОЙ модели
    const newPost = new Post({
      user: req.user.id,
      image: `/uploads/${fileName}`,
      caption,
    });

    await newPost.save();

    // Отправляем уведомление через сокеты (если нужно сразу)
    const io = req.app.get("io");
    if (io) io.emit("new_post", { message: "Новый пост!", post: newPost });

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};
