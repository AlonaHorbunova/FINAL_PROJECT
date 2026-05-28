import type { Request, Response, NextFunction } from "express";
import { User } from "../db/models/User.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { CustomError } from "../utils/CustomError.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * РЕГИСТРАЦИЯ
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Валидация входных данных
    if (!username || !email || !password || !fullName) {
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
      fullName,
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
    const user = await User.findOne({ email }).select("+password"); // Явно просим пароль

    if (!user || !user.password) {
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
        fullName: user.fullName,
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
    // TypeScript теперь сам знает, что у req есть .user!
    const user = await User.findById(req.user?.id).select("-password");

    if (!user) {
      throw new CustomError("Пользователь не найден", 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
// 1. Запрос на сброс пароля (Отправка РЕАЛЬНОГО письма)
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { identity } = req.body;

    // Ищем пользователя по email или username
    const user = await User.findOne({
      $or: [{ email: identity }, { username: identity }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Пользователь с такими данными не найден." });
    }

    // Генерируем случайный токен
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Хешируем его для безопасности и сохраняем в БД
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // Ссылка живет 10 минут

    await user.save();

    // Ссылка, которая ведет на страницу  Фронтенда (порт 5173)
    const resetUrl = `http://localhost:5173/reset-password-confirm/${resetToken}`;

    // Красивая HTML-верстка для письма
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dbdbdb;">
        <h2 style="color: #262626; text-align: center;">Сброс пароля на ICHGRAM</h2>
        <p>Приветствуем, ${user.fullName}!</p>
        <p>Вы получили это письмо, потому что запросили сброс пароля для своего аккаунта.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0095f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Восстановить пароль
          </a>
        </p>
        <p style="font-size: 12px; color: #8e8e8e;">Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
        <p style="font-size: 12px; color: #0095f6; word-break: break-all;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #dbdbdb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #8e8e8e;">Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
      </div>
    `;

    try {
      // Пытаемся отправить письмо
      await sendEmail({
        email: user.email,
        subject: "Восстановление пароля | ICHGRAM",
        html: message,
      });

      return res.status(200).json({
        message: "Ссылка для сброса пароля успешно отправлена на ваш Email.",
      });
    } catch (error) {
      // Если отправка почты сорвалась (например, неверные настройки SMTP), очищаем поля в БД
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.error("Ошибка отправки почты:", error);
      return res.status(500).json({
        message: "Не удалось отправить письмо. Проверьте настройки SMTP.",
      });
    }
  } catch (error) {
    next(error);
  }
};

// 2. Установка нового пароля (Принятие токена с фронтенда)
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token as string)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Ссылка устарела или недействительна." });
    }

    // ХЕШИРУЕМ ПАРОЛЬ ПЕРЕД СОХРАНЕНИЕМ! (Исправили ошибку)
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res
      .status(200)
      .json({ message: "Пароль успешно изменен. Теперь вы можете войти!" });
  } catch (error) {
    next(error);
  }
};
