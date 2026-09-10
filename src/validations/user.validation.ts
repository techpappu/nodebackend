import { z } from "zod";
import { emailSchema, objectIdSchema, passwordSchema } from "./common.validation";

export const userIdSchema = z.object({ params: z.object({ id: objectIdSchema }) });
export const createUserSchema = z.object({ body: z.object({
  name: z.string().trim().min(1).max(100), email: emailSchema, password: passwordSchema,
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  interests: z.array(z.string().trim().min(1).max(50).toLowerCase()).max(20).default([]),
}) });
export const updateUserSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    name: z.string().trim().min(1).max(100).optional(), email: emailSchema.optional(),
    password: passwordSchema.optional(), role: z.enum(["USER", "ADMIN"]).optional(),
    interests: z.array(z.string().trim().min(1).max(50).toLowerCase()).max(20).optional(),
  }).refine((body) => Object.keys(body).length > 0, "Provide a field to update"),
});
