import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
  receiver: Types.ObjectId;
  issuer: Types.ObjectId;
  type: "like" | "comment" | "follow";
  post?: Types.ObjectId;
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issuer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "comment", "follow"], required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification = model<INotification>(
  "Notification",
  notificationSchema,
);
