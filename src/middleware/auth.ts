import type { RequestHandler } from "express";
import { User } from "../models/user.model";
import { AppError } from "../utils/app-error";
import { asyncHandler } from "../utils/async-handler";
import { verifyToken } from "../utils/jwt";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new AppError(401, "Authentication required");

  let payload;
  try { payload = verifyToken(header.slice(7)); }
  catch { throw new AppError(401, "Invalid or expired token"); }

  const user = await User.findById(payload.userId);
  if (!user) throw new AppError(401, "User no longer exists");
  req.user = user;
  next();
});

export const authorizeRole = (...roles: Array<"USER" | "ADMIN">): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return next(new AppError(403, "Forbidden"));
    next();
  };
