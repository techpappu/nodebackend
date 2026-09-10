import { Router } from "express";
import * as controller from "../controllers/user.controller";
import { authenticate, authorizeRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { createUserSchema, updateUserSchema, userIdSchema } from "../validations/user.validation";
import { userPostsSchema } from "../validations/post.validation";

export const userRouter = Router();

// Public because posts are public; the pipeline returns only safe user fields.
userRouter.get("/public", asyncHandler(controller.publicList));
userRouter.get("/:id/posts", validate(userPostsSchema), asyncHandler(controller.posts));
userRouter.use(authenticate, authorizeRole("ADMIN"));
userRouter.get("/group/interests", asyncHandler(controller.groupByInterests));
userRouter.route("/").get(asyncHandler(controller.list)).post(validate(createUserSchema), asyncHandler(controller.create));
userRouter.route("/:id").put(validate(updateUserSchema), asyncHandler(controller.update)).delete(validate(userIdSchema), asyncHandler(controller.remove));
