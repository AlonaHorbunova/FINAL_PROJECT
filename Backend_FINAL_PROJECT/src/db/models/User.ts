import { Schema, model, Document, Types } from "mongoose";

// 1. Описываем интерфейс
export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  fullName: string;
  password?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Добавили сюда:
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

// 2. Описываем схему для MongoDB
const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    website: { type: String, default: "" },
    // И обязательно добавляем в саму схему:
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true },
);

// 3. Создаем и экспортируем модель
export const User = model<IUser>("User", userSchema);
