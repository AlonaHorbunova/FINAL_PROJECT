import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    chatId: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    fileUrl: { type: String, default: null },
  },
  { timestamps: true },
);
messageSchema.index({ chatId: 1, createdAt: -1 });

export const Message = model("Message", messageSchema);
