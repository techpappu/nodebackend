import { User } from "../models/user.model";
import { AppError } from "../utils/app-error";
import { signToken } from "../utils/jwt";

export async function register(input: { name: string; email: string; password: string; interests: string[] }) {
  const user = await User.create(input);
  return { user, token: signToken({ userId: user.id, role: user.role }) };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) throw new AppError(401, "Invalid email or password");
  return { user, token: signToken({ userId: user.id, role: user.role }) };
}
