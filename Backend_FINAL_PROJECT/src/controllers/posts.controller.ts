import type { Request, Response, NextFunction } from "express";
import { Post } from "../db/models/Post.js";
import { CustomError } from "../utils/CustomError.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; // ИЗМЕНЕНИЕ: Импорт AWS SDK
import sharp from "sharp";

// Расширяем интерфейс, чтобы TS видел и пользователя, и файл от multer
interface AuthRequest extends Request {
  user?: { id: string };
  file?: Express.Multer.File;
}

// ИЗМЕНЕНИЕ: Инициализация клиента AWS S3 (использует переменные из .env)
const s3 = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = "my-finalproject-insta-bucket-2026";

// 1. Получить все посты (БЕЗ ИЗМЕНЕНИЙ)
export const getAllPosts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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

    // ИЗМЕНЕНИЕ: Формируем имя ключа внутри бакета S3
    const fileName = `uploads/post-${req.user.id}-${Date.now()}.webp`;

    // ИЗМЕНЕНИЕ: Обрабатываем картинку через sharp прямо в буфер памяти (без сохранения на диск)
    const optimizedImageBuffer = await sharp(req.file.buffer)
      .resize(1080, 1080, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    // ИЗМЕНЕНИЕ: Загрузка оптимизированного буфера в Amazon S3
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: optimizedImageBuffer,
        ContentType: "image/webp", // Чтобы браузер открывал фото, а не скачивал
      }),
    );

    // ИЗМЕНЕНИЕ: Ссылка теперь указывает на облако AWS
    const s3ImageUrl = `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${fileName}`;

    console.log("Попытка сохранить пост с данными в AWS:");

    // Сохранение записи строго по схеме
    const newPost = new Post({
      author: req.user.id,
      imageUrl: s3ImageUrl, // ИЗМЕНЕНИЕ: Передаем ссылку на S3
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

    // БЕЗОПАСНЫЙ БЛОК СОКЕТОВ (БЕЗ ИЗМЕНЕНИЙ)
    try {
      const io = req.app.get("io");
      if (io && populatedPost) {
        io.emit("new_post", { message: "Новый post!", post: populatedPost });
      }
    } catch (socketError) {
      console.error("Ошибка отправки события через Socket.io:", socketError);
    }

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};
