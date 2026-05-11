import express, {
  type Request,
  type Response,
  type Application,
} from "express";
import http from "http";
import { initSocket } from "./socket/socket.service.js";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";
import authRoutes from "./routes/auth.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import likeRoutes from "./routes/like.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import userRoutes from "./routes/user.routes.js";

const startServer = (): void => {
  const app: Application = express();

  const server = http.createServer(app);

  const io = initSocket(server);
  app.set("io", io);

  app.use(cors());
  app.use(express.json());

  app.get("/", (req: Request, res: Response) => res.send("Я родился!"));

  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postsRoutes);
  app.use("/api/likes", likeRoutes);
  app.use("/api/comments", commentRoutes); // Добавлено
  app.use("/api/notifications", notificationRoutes); // Добавлено
  app.use("/api/users", userRoutes);
  app.use("/uploads", express.static("uploads"));

  app.use(notFound);
  app.use(errorHandler);

  const port = Number(process.env.PORT) || 3000;
  server.listen(port, () => console.log(`Сервер запущен на порту ${port}`));
};

export default startServer;
