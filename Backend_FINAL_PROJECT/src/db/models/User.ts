import { Schema, model, Document, Types } from "mongoose";

// 1. Описываем интерфейс (это и есть то, что мы пытаемся импортировать)
export interface IUser {
  _id: Types.ObjectId; // или string, если тебе так удобнее
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Описываем схему для MongoDB
const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  { timestamps: true },
);

// 3. Создаем и экспортируем модель
export const User = model<IUser>("User", userSchema);
