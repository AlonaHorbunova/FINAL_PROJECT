import type { Request, Response, NextFunction } from "express";
import { Post } from "../db/models/Post.js";
import { CustomError } from "../utils/CustomError.js";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Расширяем интерфейс, чтобы TS видел и пользователя, и файл от multer
interface AuthRequest extends Request {
  user?: { id: string };
  file?: Express.Multer.File;
}

export const getAllPosts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const posts = await Post.find()
      .populate("user", "username avatar") // Подтягиваем данные автора
      .sort({ createdAt: -1 });
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

    // Определяем папку. Давай использовать 'uploads' в корне, как договаривались
    const uploadDir = "uploads";
    const fileName = `post-${Date.now()}.webp`;
    const outputPath = path.join(uploadDir, fileName);

    // Создаем папку, если забыли
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // SHARP: Берем буфер из памяти, сжимаем и сохраняем на диск
    await sharp(req.file.buffer)
      .resize(1080, 1080, { fit: "cover" }) // 'cover' лучше для Инстаграма (заполнит квадрат)
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Сохраняем в базу
    const newPost = new Post({
      user: req.user.id,
      image: `/uploads/${fileName}`, // Этот путь будет отдавать статика
      caption,
    });

    await newPost.save();

    // Сокеты
    const io = req.app.get("io");
    if (io) io.emit("new_post", { message: "Новый пост!", post: newPost });

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};
