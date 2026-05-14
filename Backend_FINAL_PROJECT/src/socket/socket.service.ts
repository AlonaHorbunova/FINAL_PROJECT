import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";

// Добавляем переменную, которую будем экспортировать
export let io: SocketServer;

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Твой код из image_86d17d.png остается без изменений
    console.log(`👤 Socket: Пользователь подключился (${socket.id})`);

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
