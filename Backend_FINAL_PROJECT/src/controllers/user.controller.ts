import type { Response, NextFunction } from "express";
// Добавляем type перед AuthRequest, чтобы успокоить verbatimModuleSyntax
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { User } from "../db/models/User.js";
import { CustomError } from "../utils/CustomError.js";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Описываем строгий интерфейс для входящих текстовых полей формы
interface UpdateProfileInput {
  username?: string;
  fullName?: string;
  bio?: string;
  website?: string;
  avatar?: string;
}

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

    // Сборка объекта обновлений с типом Partial (без any!)
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
    if (
      typeof website === "string" &&
      website.trim() !== "" &&
      website !== "undefined"
    ) {
      updateData.website = website.trim();
    }

    // Если в форме было прикреплено новое изображение (Аватарка)
    if (req.file) {
      // УЧТЕНО: Сохраняем СТРОГО в папку public/uploads для аватарок
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const fileName = `avatar-${userId}-${Date.now()}.webp`;
      const outputPath = path.join(uploadDir, fileName);

      // Проверяем существование папки public/uploads, чтобы Sharp не упал
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Сжимаем аватарку в аккуратный квадрат 200x200
      await sharp(req.file.buffer)
        .resize(200, 200, { fit: "cover" })
        .webp({ quality: 80 })
        .toFile(outputPath);

      // Записываем путь для базы данных (наш общий статический префикс)
      updateData.avatar = `/uploads/${fileName}`;
    }

    // Если в итоге обновлять нечего
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
