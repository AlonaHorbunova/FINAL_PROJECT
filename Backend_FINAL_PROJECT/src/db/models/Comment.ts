import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
  text: string;
}

const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

export const Comment = model<IComment>("Comment", commentSchema);
