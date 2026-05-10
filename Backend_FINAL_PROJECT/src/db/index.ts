import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl = process.env.MONGO_URL as string;
const dbName = process.env.DB_NAME;

export async function connectDB(): Promise<void> {
  try {
    if (!mongoUrl) {
      console.error("Ошибка: MONGO_URL не найден в .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUrl, {
      dbName: dbName || "test",
    });

    console.log(`Подключение к MongoDB успешно. База: ${dbName || "test"}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Ошибка подключения к базе:", error.message);
    } else {
      console.error("Неизвестная ошибка подключения к базе");
    }
    process.exit(1);
  }
}

export async function closeDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    console.log("Соединение с MongoDB закрыто.");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Ошибка при закрытии базы:", error.message);
    }
  }
}
