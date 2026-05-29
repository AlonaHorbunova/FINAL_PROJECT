import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { User } from "../db/models/User.js";
import { CustomError } from "../utils/CustomError.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; 
import sharp from "sharp";

interface UpdateProfileInput {
  username?: string;
  fullName?: string;
  bio?: string;
  website?: string;
  avatar?: string;
}

// Настройка клиента AWS S3 для работы с бакетом
const s3 = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = "my-finalproject-insta-bucket-2026";

// 1. Получить профиль текущего (авторизованного) пользователя 
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) throw new CustomError("Пользователь не найден", 404);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// 2. Получить профиль любого пользователя по его ID 
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) throw new CustomError("Пользователь не найден", 404);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// 3. Универсальное обновление профиля (данные + аватарка)
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new CustomError("Недостаточно прав", 401);
    }

    // Безопасно забираем текстовые данные из тела запроса 
    const { username, fullName, bio, website } = req.body as UpdateProfileInput;

    // Сборка объекта обновлений с типом Partial 
    const updateData: Partial<UpdateProfileInput> = {};

    // Записываем данные, только если это реальные строки и они не равны "undefined" 
    if (
      typeof username === "string" &&
      username.trim() !== "" &&
      username !== "undefined"
    ) {
      updateData.username = username.trim();
    }
    if (
      typeof fullName === "string" &&
      fullName.trim() !== "" &&
      fullName !== "undefined"
    ) {
      updateData.fullName = fullName.trim();
    }
    if (typeof bio === "string" && bio.trim() !== "" && bio !== "undefined") {
      updateData.bio = bio.trim();
    }
    if (typeof website === "string" && website !== "undefined") {
      updateData.website = website.trim();
    }

    // Если в форме было прикреплено новое изображение (Аватарка)
    if (req.file) {
      //  Формируем имя файла для папки avatars внутри AWS S3
      const fileName = `avatars/avatar-${userId}-${Date.now()}.webp`;

      //  Сжимаем аватарку в аккуратный квадрат 200x200 напрямую в буфер памяти
      const optimizedAvatarBuffer = await sharp(req.file.buffer)
        .resize(200, 200, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      //  Отправляем сжатый буфер в облако Amazon S3
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: optimizedAvatarBuffer,
          ContentType: "image/webp", 
        }),
      );

      //  Записываем в базу данных полную прямую ссылку на AWS S3
      updateData.avatar = `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${fileName}`;
    }

    
    if (Object.keys(updateData).length === 0) {
      throw new CustomError("Нет данных для обновления", 400);
    }

    // Сохраняем все изменения в базу одной транзакцией 
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      throw new CustomError("Пользователь не найден", 404);
    }

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
};
export const followUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const myId = req.user?.id;
    const { id: targetId } = req.params;

    if (myId === targetId)
      throw new CustomError("Нельзя подписаться на самого себя", 400);

    
    await User.findByIdAndUpdate(myId, { $addToSet: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: myId } });

    res.json({ message: "Успешная подписка" });
  } catch (error) {
    next(error);
  }
};
// 4. Живой поиск пользователей по юзернейму или полному имени
export const searchUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = req.query;
    const myId = req.user?.id;

    // Если поисковый запрос пустой, отдаем пустой массив
    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.json({ users: [] });
    }

    // Ищем пользователей, чьи username или fullName подходят под паттерн
    
    const users = await User.find({
      _id: { $ne: myId },
      $or: [
        { username: { $regex: query.trim(), $options: "i" } },
        { fullName: { $regex: query.trim(), $options: "i" } },
      ],
    })
      .select("username fullName avatar") 
      .limit(10); 

    res.json({ users });
  } catch (error) {
    next(error);
  }
};
