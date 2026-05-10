import multer from "multer";
import path from "path";
import { CustomError } from "../utils/CustomError.js";

// Настройка места хранения
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // ВАЖНО: создай папку 'uploads' в корне проекта вручную!
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    // Генерируем уникальное имя: дата + случайное число + расширение
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

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
