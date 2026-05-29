import { Schema, model } from "mongoose";

const postsSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String, default: "", maxlength: 2200 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }, // Опции схемы
);

export const Post = model("Post", postsSchema);
