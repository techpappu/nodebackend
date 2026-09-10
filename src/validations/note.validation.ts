import { z } from "zod";
import { objectIdSchema } from "./common.validation";

const fields = {
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(50_000),
};
export const createNoteSchema = z.object({ body: z.object(fields) });
export const updateNoteSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object(fields).partial().refine((body) => Object.keys(body).length > 0, "Provide a field to update"),
});
export const noteIdSchema = z.object({ params: z.object({ id: objectIdSchema }) });
