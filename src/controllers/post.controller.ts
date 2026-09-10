import type { Request, Response } from "express";
import { Post } from "../models/post.model";

export async function create(req: Request, res: Response) {
  const post = await Post.create({ ...req.body, userId: req.user!._id });
  res.status(201).json({ success: true, data: post });
}
