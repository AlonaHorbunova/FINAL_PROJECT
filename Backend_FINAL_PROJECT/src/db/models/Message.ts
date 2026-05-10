import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    chatId: { type: String, required: true }, // Уникальный ID диалога (обычно комбинация ID двух юзеров)
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

export const Message = model("Message", messageSchema);
