import multer, { type FileFilterCallback } from "multer"; // Добавили FileFilterCallback
import type { Request } from "express"; // Импортируем тип запроса
import { CustomError } from "../utils/CustomError.js";

const storage = multer.memoryStorage();

// Типизируем функцию фильтра
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback, // Вместо any используем специальный тип колбэка
): void => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // В колбэк передаем ошибку
    cb(
      new CustomError(
        "Недопустимый формат файла. Только JPEG, PNG или WEBP",
        400,
      ) as any,
    );
    // Маленький нюанс: multer старых версий иногда требует здесь as any,
    // но в параметрах функции (строка 8) мы от any избавились!
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 МБ
  },
});
