import { Schema, model, type Types } from "mongoose";

export interface IPost {
  title: string;
  content: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 50_000 },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true, versionKey: false });

postSchema.index({ userId: 1, createdAt: -1 });

export const Post = model<IPost>("Post", postSchema);
