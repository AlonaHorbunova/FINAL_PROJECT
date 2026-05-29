import multer, { type FileFilterCallback } from "multer"; // Добавили FileFilterCallback
import type { Request } from "express"; // Импортируем тип запроса
import { CustomError } from "../utils/CustomError.js";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
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
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 МБ
  },
});
