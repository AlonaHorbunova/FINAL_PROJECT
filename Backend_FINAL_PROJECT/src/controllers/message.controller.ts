import type { Request, Response, NextFunction } from "express"; // Обычный Request!
import { Message } from "../db/models/Message.js";
import { io } from "../socket/socket.service.js";

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { chatId, receiver, text } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Не авторизован" });

    const newMessage = await Message.create({
      chatId,
      sender: userId,
      receiver,
      text,
    });

    const populatedMessage = await newMessage.populate(
      "sender",
      "username avatar",
    );

    if (io) {
      io.to(receiver).emit("new_message", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

export const getChatMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};
// Получить количество всех непрочитанных сообщений для юзера
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const count = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

// Пометить сообщения в чате как прочитанные
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id;
    await Message.updateMany(
      { chatId, receiver: userId, isRead: false },
      { $set: { isRead: true } },
    );
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    next(error);
  }
};
