// src/middlewares/authMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../utils/CustomError.js";

export const authMiddleware = async (
  req: any,
  res: any,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError("Не авторизован", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
    ) as any;

    req.user = decoded; // Добавляем данные пользователя в запрос
    next();
  } catch (error) {
    next(new CustomError("Невалидный токен", 401));
  }
};
