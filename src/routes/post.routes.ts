import { Router } from "express";
import { create } from "../controllers/post.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { createPostSchema } from "../validations/post.validation";

export const postRouter = Router();
postRouter.post("/", authenticate, validate(createPostSchema), asyncHandler(create));
