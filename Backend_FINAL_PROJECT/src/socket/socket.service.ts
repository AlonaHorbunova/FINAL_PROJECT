import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";

export const initSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*", // Позже здесь будет адрес твоего фронтенда
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`👤 Socket: Пользователь подключился (${socket.id})`);

    // Юзер заходит в комнату своего ID, чтобы получать личные сообщения
    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`🚪 Юзер ${userId} в сети`);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket: Пользователь отключился");
    });
  });

  return io;
};