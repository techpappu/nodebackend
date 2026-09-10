import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { loginSchema, registerSchema } from "../validations/auth.validation";

export const authRouter = Router();
authRouter.post("/register", validate(registerSchema), asyncHandler(controller.register));
authRouter.post("/login", validate(loginSchema), asyncHandler(controller.login));
authRouter.get("/me", authenticate, asyncHandler(controller.me));
