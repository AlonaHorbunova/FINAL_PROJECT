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
    const userId = req.user?.id; // Теперь это легально без 'as any' и без кастомных интерфейсов

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
