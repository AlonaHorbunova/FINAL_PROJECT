import type { Request, Response, NextFunction } from "express";
import { User } from "../db/models/User.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { CustomError } from "../utils/CustomError.js";

/**
 * РЕГИСТРАЦИЯ
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, email, password } = req.body;

    // Валидация входных данных
    if (!username || !email || !password) {
      throw new CustomError("Заполните все поля", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError("Email уже занят", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Пользователь создан успешно",
      userId: newUser._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ЛОГИН
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError("Введите email и пароль", 400);
    }

    // Ищем пользователя и явно просим Mongoose вернуть пароль для проверки
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError("Пользователь не найден", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomError("Неверный пароль", 401);
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ПОЛУЧЕНИЕ ДАННЫХ О СЕБЕ (GET ME)
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById((req as any).user?.id).select("-password");

    if (!user) {
      throw new CustomError("Пользователь не найден", 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
