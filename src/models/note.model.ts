import { Schema, model, type Types } from "mongoose";

export interface INote {
  title: string;
  content: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 50_000 },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true, versionKey: false });

noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ createdAt: -1 });

export const Note = model<INote>("Note", noteSchema);
