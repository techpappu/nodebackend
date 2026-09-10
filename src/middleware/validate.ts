import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export function validate(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) return next(result.error);
    const data = result.data as { body?: unknown; params?: unknown; query?: unknown };
    if (data.body) req.body = data.body;
    if (data.params) req.params = data.params as typeof req.params;
    next();
  };
}
