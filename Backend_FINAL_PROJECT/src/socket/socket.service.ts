import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
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

    //  2. ДОБАВЛЯЕМ СЛУШАТЕЛЬ ДЛЯ ОТПРАВКИ И СОХРАНЕНИЯ СООБЩЕНИЙ
    socket.on("send_message", async (data) => {
      try {
        const { chatId, sender, receiver, text } = data;

        const senderId =
          typeof sender === "object" && sender
            ? sender._id || sender.id
            : sender;

        const receiverId =
          typeof receiver === "object" && receiver
            ? receiver._id || receiver.id
            : receiver;

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
