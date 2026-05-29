import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../utils/CustomError.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

interface DecodedToken {
  id: string;
  username: string;
  email: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError("Не авторизован", 401);
    }

    const token = authHeader.split(" ")[1];

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
