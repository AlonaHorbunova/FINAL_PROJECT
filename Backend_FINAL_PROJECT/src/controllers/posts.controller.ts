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

// 1. Получить все посты (ВОЗВРАЩАЕМ К ПОЛЮ author)
export const getAllPosts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Подтягиваем информацию об авторах строго через поле "author", как в твоей схеме
    const posts = await Post.find()
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// 2. Создать новый пост
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

    // Абсолютный путь к корневой папке uploads
    const uploadDir = path.join(process.cwd(), "uploads");
    const fileName = `post-${req.user.id}-${Date.now()}.webp`;
    const outputPath = path.join(uploadDir, fileName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Сжатие изображения
    await sharp(req.file.buffer)
      .resize(1080, 1080, { fit: "cover" })
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log("Попытка сохранить пост с данными:", {
      author: req.user.id,
      imageUrl: `/uploads/${fileName}`,
      caption,
    });

    // Сохранение записи строго по схеме (author и imageUrl)
    const newPost = new Post({
      author: req.user.id,
      imageUrl: `/uploads/${fileName}`,
      caption:
        typeof caption === "string" && caption !== "undefined"
          ? caption.trim()
          : "",
    });

    await newPost.save();

    // Подтягиваем автора для ответа
    const populatedPost = await Post.findById(newPost._id).populate(
      "author",
      "username avatar",
    );

    // БЕЗОПАСНЫЙ БЛОК СОКЕТОВ: падение сокетов больше не уронит сам контроллер
    try {
      const io = req.app.get("io");
      if (io && populatedPost) {
        io.emit("new_post", { message: "Новый post!", post: populatedPost });
      }
    } catch (socketError) {
      console.error("Ошибка отправки события через Socket.io:", socketError);
    }

    // Гарантированно возвращаем успешный ответ на фронтенд
    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};
