import bcrypt from "bcryptjs";
import { Schema, model, type HydratedDocument } from "mongoose";

export type Role = "USER" | "ADMIN";
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  interests: [{ type: String, trim: true, lowercase: true }],
}, { timestamps: true, versionKey: false });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ interests: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre("save", async function () {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as unknown as { password?: string }).password;
    return ret;
  },
});

export type UserDocument = HydratedDocument<IUser>;
export const User = model<IUser>("User", userSchema);
