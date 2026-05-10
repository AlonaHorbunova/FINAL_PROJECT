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
  } catch (error: any) {
    console.error("Ошибка при запуске приложения:", error.message);
    process.exit(1);
  }
};

bootstrap();
