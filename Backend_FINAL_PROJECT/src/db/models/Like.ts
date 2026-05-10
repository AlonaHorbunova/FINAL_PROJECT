import { Schema, model, Document, Types } from "mongoose";

export interface ILike extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
}

const likeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true },
);

// Индекс, чтобы один юзер не мог лайкнуть один и тот же пост дважды
likeSchema.index({ user: 1, post: 1 }, { unique: true });

export const Like = model<ILike>("Like", likeSchema);
