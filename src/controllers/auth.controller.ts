import type { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function register(req: Request, res: Response) {
  const data = await authService.register(req.body);
  res.status(201).json({ success: true, data });
}
export async function login(req: Request, res: Response) {
  const data = await authService.login(req.body.email, req.body.password);
  res.json({ success: true, data });
}
export async function me(req: Request, res: Response) {
  res.json({ success: true, data: req.user });
}
