import jwt from "jsonwebtoken";
import { type IUser } from "../db/models/User.js"; // Импортируем наш интерфейс

const generateToken = (user: IUser): string => {
  // Мы берем только необходимые данные, чтобы токен не был слишком тяжелым
  const payload = {
    id: user._id, // В MongoDB это ObjectId, jwt преобразует его в строку
    username: user.username,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET не определен в переменных окружения!");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "30d", // Токен будет жить 30 дней
  });
};

export default generateToken;
