import type { Request, Response } from "express";
import { Note } from "../models/note.model";
import { AppError } from "../utils/app-error";
import { paginationMeta, parsePagination } from "../utils/pagination";

const scope = (req: Request) => req.user!.role === "ADMIN" ? {} : { userId: req.user!._id };

export async function create(req: Request, res: Response) {
  const note = await Note.create({ ...req.body, userId: req.user!._id });
  res.status(201).json({ success: true, data: note });
}
export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = scope(req);
  const [data, total] = await Promise.all([
    Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), Note.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(page, limit, total) });
}
export async function get(req: Request, res: Response) {
  const note = await Note.findOne({ _id: req.params.id, ...scope(req) });
  if (!note) throw new AppError(404, "Note not found");
  res.json({ success: true, data: note });
}
export async function update(req: Request, res: Response) {
  const note = await Note.findOneAndUpdate({ _id: req.params.id, ...scope(req) }, req.body, { new: true, runValidators: true });
  if (!note) throw new AppError(404, "Note not found");
  res.json({ success: true, data: note });
}
export async function remove(req: Request, res: Response) {
  const note = await Note.findOneAndDelete({ _id: req.params.id, ...scope(req) });
  if (!note) throw new AppError(404, "Note not found");
  res.json({ success: true, data: { message: "Note deleted" } });
}
