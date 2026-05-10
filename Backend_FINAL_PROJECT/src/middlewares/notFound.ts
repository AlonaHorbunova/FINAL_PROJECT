import type { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/CustomError.js";

export default function notFound(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const error = new CustomError(
    `Маршрут ${req.method} ${req.originalUrl} не найден`,
    404,
  );
  next(error);
}
