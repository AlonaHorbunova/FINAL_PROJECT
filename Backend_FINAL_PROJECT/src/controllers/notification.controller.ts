import type { Request, Response, NextFunction } from "express";
import { Notification } from "../db/models/Notification.js";

export const getMyNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const notifications = await Notification.find({ receiver: req.user?.id })
      .populate("issuer", "username avatar")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};
