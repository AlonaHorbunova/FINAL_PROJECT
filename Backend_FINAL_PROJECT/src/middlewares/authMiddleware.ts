import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../utils/CustomError.js";

// Создаем простой интерфейс именно для данных из токена
interface DecodedToken {
  id: string;
  username: string;
  email: string;
}

// Расширяем Request, используя DecodedToken
interface AuthRequest extends Request {
  user?: DecodedToken;
}

export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new CustomError("Нет токена, авторизация отклонена", 401));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new CustomError("Формат токена неверен", 401));
  }

  try {
    // Декодируем как unknown, потом приводим к DecodedToken
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as unknown as DecodedToken;

    req.user = decoded;
    next();
  } catch (error) {
    next(new CustomError("Токен не валиден", 401));
  }
};