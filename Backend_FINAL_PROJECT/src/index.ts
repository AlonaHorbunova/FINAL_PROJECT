import "dotenv/config";
import { connectDB, closeDB } from "./db/index.js";
import startServer from "./server.js";

process.on("SIGINT", async () => {
  console.log("Завершение работы приложения (SIGINT)...");
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Завершение работы приложения (SIGTERM)...");
  await closeDB();
  process.exit(0);
});

const bootstrap = async (): Promise<void> => {
  try {
    await connectDB();
    startServer();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Ошибка при запуске приложения:", error.message);
    } else {
      console.error("Неизвестная ошибка при запуске приложения:", error);
    }
    process.exit(1);
  }
};

bootstrap();
