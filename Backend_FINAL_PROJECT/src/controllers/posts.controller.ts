import type { Request, Response, NextFunction } from "express";
import { Post } from "../db/models/Post.js";
import { Like } from "../db/models/Like.js"; // Добавили модель лайков для склейки
import { Comment } from "../db/models/Comment.js"; // Добавили модель комментов для склейки
import { CustomError } from "../utils/CustomError.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

// Расширяем интерфейс, чтобы TS видел и пользователя, и файл от multer
interface AuthRequest extends Request {
  user?: { id: string };
  file?: Express.Multer.File;
}

// Инициализация клиента AWS S3 (использует переменные из .env)
const s3 = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = "my-finalproject-insta-bucket-2026";

// 1. Получить все постов (С полной агрегацией лайков и комментариев)
export const getAllPosts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Вытаскиваем сначала сами посты
    const posts = await Post.find()
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    // Склеиваем каждый пост с его лайками и комментариями из соседних коллекций
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        // Находим лайки к посту и собираем строковые ID пользователей
        const likesDocs = await Like.find({ post: post._id });
        const likes = likesDocs.map((like) => like.user.toString());

        // Находим комменты к посту и сразу наполняем их данными авторов (username, avatar)
        const comments = await Comment.find({ post: post._id })
          .populate("user", "username avatar")
          .sort({ createdAt: 1 }); // Хронологический порядок (старые вверху, новые внизу)

        // Возвращаем пост, подмешивая актуальные массивы лайков и комментов
        return {
          ...post.toObject(),
          likes: likes,
          comments: comments,
        };
      }),
    );

    res.json(postsWithDetails);
  } catch (error) {
    next(error);
  }
};

// 2. Создать новый пост (Твоя оригинальная логика с AWS S3 и Sharp)
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

    // Формируем имя ключа внутри бакета S3
    const fileName = `uploads/post-${req.user.id}-${Date.now()}.webp`;

    // Обрабатываем картинку через sharp прямо в буфер памяти (без сохранения на диск)
    const optimizedImageBuffer = await sharp(req.file.buffer)
      .resize(1080, 1080, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    // Загрузка оптимизированного буфера в Amazon S3
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: optimizedImageBuffer,
        ContentType: "image/webp", // Чтобы браузер открывал фото, а не скачивал
      }),
    );

    // Ссылка теперь указывает на облако AWS
    const s3ImageUrl = `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${fileName}`;

    console.log("Попытка сохранить пост с данными в AWS:");

    // Сохранение записи строго по схеме
    const newPost = new Post({
      author: req.user.id,
      imageUrl: s3ImageUrl,
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

    // БЕЗОПАСНЫЙ БЛОК СОКЕТОВ
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
