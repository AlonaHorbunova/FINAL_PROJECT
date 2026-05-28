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
        // Лог для отладки — посмотрим, что присылает фронтенд при смене юзера
        console.log("Получены данные сокета send_message:", data);

        // 1. Извлекаем все нужные поля из прилетевших данных
        const { chatId, sender, receiver, text } = data;

        // Умная проверка отправителя: если это объект — берем _id или id, если строка — берем её напрямую
        const senderId =
          typeof sender === "object" && sender
            ? sender._id || sender.id
            : sender;

        // Точно такая же проверка для получателя (на всякий случай)
        const receiverId =
          typeof receiver === "object" && receiver
            ? receiver._id || receiver.id
            : receiver;

        // Если фронтенд вообще забыл прислать отправителя, прерываем выполнение, чтобы база не падала
        if (!senderId) {
          console.error(
            "❌ Ошибка: senderId пустой! Сообщение не будет сохранено.",
            { sender },
          );
          return;
        }

        // 2. Создаем сообщение в MongoDB
        const newMessage = await Message.create({
          chatId,
          sender: senderId,
          receiver: receiverId,
          text,
        });

        // 3. Подгружаем инфо об отправителе (username, avatar) для фронтенда
        const populatedMessage = await newMessage.populate(
          "sender",
          "username avatar",
        );

        // 4. Отправляем получателю готовый объект сообщения
        io.to(receiverId).emit("new_message", populatedMessage);

        console.log(
          `✅ Сообщение от ${senderId} к ${receiverId} успешно сохранено и отправлено!`,
        );
      } catch (error) {
        console.error("❌ Ошибка при сохранении сокет-сообщения в БД:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket: Пользователь отключился");
    });
  });

  return io;
};
