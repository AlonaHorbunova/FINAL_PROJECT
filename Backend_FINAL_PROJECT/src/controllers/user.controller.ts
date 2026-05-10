import type { Request, Response, NextFunction } from "express";
import { User } from "../db/models/User.js";
import { CustomError } from "../utils/CustomError.js";
import sharp from "sharp";
import path from "path";

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) throw new CustomError("Файл не загружен", 400);

    const fileName = `avatar-${req.user?.id}-${Date.now()}.webp`;
    const outputPath = path.join("public", "uploads", fileName);

    await sharp(req.file.buffer)
      .resize(200, 200) // Аватарке не нужно 1080p
      .webp({ quality: 80 })
      .toFile(outputPath);

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { avatar: `/uploads/${fileName}` },
      { new: true },
    );

    res.json(user);
  } catch (error) {
    next(error);
  }
};
