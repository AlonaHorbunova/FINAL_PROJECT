import multer from "multer";
import { CustomError } from "../utils/CustomError.js";

// Используем memoryStorage, чтобы Sharp мог обработать файл из буфера (req.file.buffer)
const storage = multer.memoryStorage();

// Фильтр файлов: разрешаем только изображения
const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new CustomError(
        "Недопустимый формат файла. Только JPEG, PNG или WEBP",
        400,
      ),
      false,
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Максимум 5 МБ
  },
});
