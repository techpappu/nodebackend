import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid resource ID");
export const emailSchema = z.string().trim().email("Invalid email address").toLowerCase();
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);
