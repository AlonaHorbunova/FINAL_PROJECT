import { io } from "socket.io-client";

// ОДИН ИНСТАНС НА ВСЕ ПРИЛОЖЕНИЕ
export const socket = io("http://localhost:3000", {
  autoConnect: true,
  reconnection: true,
});
