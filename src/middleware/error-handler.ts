import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = error instanceof AppError ? error.statusCode : 500;
  let message = error instanceof Error ? error.message : "Internal server error";

  if (error instanceof ZodError) {
    statusCode = 400;
    message = error.issues.map((issue) => issue.message).join(", ");
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(error.errors).map((item) => item.message).join(", ");
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource ID";
  } else if ((error as { code?: number }).code === 11000) {
    statusCode = 409;
    message = "Email is already registered";
  } else if (statusCode === 500) {
    message = "Internal server error";
    console.error(error);
  }

  res.status(statusCode).json({ success: false, message });
};
