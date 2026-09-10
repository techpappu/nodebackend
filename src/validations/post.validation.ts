import { z } from "zod";
import { objectIdSchema } from "./common.validation";

export const createPostSchema = z.object({ body: z.object({
  title: z.string().trim().min(1).max(200), content: z.string().min(1).max(50_000),
}) });
export const userPostsSchema = z.object({ params: z.object({ id: objectIdSchema }) });
