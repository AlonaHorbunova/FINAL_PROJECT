import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../utils/CustomError.js";

// Создаем один общий интерфейс для всего проекта
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// Интерфейс для того, что лежит внутри токена
interface DecodedToken {
  id: string;
  username: string;
  email: string;
}

export const authMiddleware = (
  req: AuthRequest, // Используем наш новый интерфейс
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError("Не авторизован", 401);
    }

    const token = authHeader.split(" ")[1];

    // Проверка: если токен не нашелся в строке, кидаем ошибку
    if (!token) {
      throw new CustomError("Токен не предоставлен", 401);
    }

    const secret = process.env.JWT_SECRET || "secret";

    const decoded = jwt.verify(token, secret) as unknown as DecodedToken;

    req.user = decoded;
    next();
  } catch (error) {
    next(new CustomError("Невалидный токен", 401));
  }
};
