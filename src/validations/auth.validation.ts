import { z } from "zod";
import { emailSchema, passwordSchema } from "./common.validation";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(100),
    email: emailSchema,
    password: passwordSchema,
    interests: z.array(z.string().trim().min(1).max(50).toLowerCase()).max(20).default([]),
  }),
});

export const loginSchema = z.object({
  body: z.object({ email: emailSchema, password: z.string().min(1, "Password is required") }),
});
