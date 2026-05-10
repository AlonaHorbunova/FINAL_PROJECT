import type { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/CustomError.js";

export default function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("Ошибка на сервере:", error);

  // Определяем статус-код
  // Если это наш CustomError, берем его статус. Иначе — 500.
  const statusCode = error instanceof CustomError ? error.statusCode : 500;

  // Определяем сообщение
  const message =
    error instanceof Error ? error.message : "Внутренняя ошибка сервера";

  res.status(statusCode).json({
    error: message,
  });
}
