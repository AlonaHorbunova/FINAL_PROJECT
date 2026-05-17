import { Schema, model } from "mongoose";

const postsSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String, default: "", maxlength: 2200 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // СВЯЗЬ С ОТДЕЛЬНОЙ КОЛЛЕКЦИЕЙ КОММЕНТАРИЕВ:
    // Мы просто говорим, что у поста есть массив ID-шников комментариев,
    // которые ссылаются на коллекцию "Comment"
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }, // Опции схемы
);

export const Post = model("Post", postsSchema);
