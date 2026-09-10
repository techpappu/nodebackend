import { Router } from "express";
import * as controller from "../controllers/note.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { createNoteSchema, noteIdSchema, updateNoteSchema } from "../validations/note.validation";

export const noteRouter = Router();
noteRouter.use(authenticate);
noteRouter.route("/").post(validate(createNoteSchema), asyncHandler(controller.create)).get(asyncHandler(controller.list));
noteRouter.route("/:id")
  .get(validate(noteIdSchema), asyncHandler(controller.get))
  .put(validate(updateNoteSchema), asyncHandler(controller.update))
  .delete(validate(noteIdSchema), asyncHandler(controller.remove));
