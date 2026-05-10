import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadFoto.js";
// Здесь позже импортируем контроллеры пользователей

const router = Router();

// Пример: получить данные своего профиля
router.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "Данные твоего профиля", user: req.user });
});

export default router;
