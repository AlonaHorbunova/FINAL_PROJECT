import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
// 1. Импортируем модель сообщений из твоей папки db/models
import { Message } from "../db/models/Message.js";

export let io: SocketServer;

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket: Пользователь подключился (${socket.id})`);

    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`Юзер ${userId} в сети`);
    });

    // 🔥 2. ДОБАВЛЯЕМ СЛУШАТЕЛЬ ДЛЯ ОТПРАВКИ И СОХРАНЕНИЯ СООБЩЕНИЙ
    socket.on("send_message", async (data) => {
      try {
        // 1. Извлекаем все нужные поля из прилетевших данных
        const { chatId, sender, receiver, text } = data;

        // 2. Создаем сообщение в MongoDB (передаем chatId обязательно!)
        const newMessage = await Message.create({
          chatId,
          sender: sender._id, // вытаскиваем чистый ID
          receiver,
          text,
        });

        // 3. Подгружаем инфо об отправителе (username, avatar), как этого ждет фронтенд
        const populatedMessage = await newMessage.populate(
          "sender",
          "username avatar",
        );

        // 4. Отправляем получателю уже полностью готовый объект сообщения
        // На фронтенде в App.tsx убедись, ловишь ли ты "new_message" или "receive_message"
        io.to(receiver).emit("new_message", populatedMessage);

        console.log("Сообщение успешно сохранено в базу и отправлено!");
      } catch (error) {
        console.error("Ошибка при сохранении сокет-сообщения в БД:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket: Пользователь отключился");
    });
  });

  return io;
};
