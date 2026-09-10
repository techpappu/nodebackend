import type { Request, Response } from "express";
import { Types } from "mongoose";
import { Note } from "../models/note.model";
import { Post } from "../models/post.model";
import { User } from "../models/user.model";
import { AppError } from "../utils/app-error";
import { paginationMeta, parsePagination } from "../utils/pagination";

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const [data, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit), User.countDocuments(),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(page, limit, total) });
}

export async function publicList(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const [data, total] = await Promise.all([
    User.find().select("name").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(page, limit, total) });
}

export async function create(req: Request, res: Response) {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
}

export async function update(req: Request, res: Response) {
  const user = await User.findById(req.params.id).select("+password");
  if (!user) throw new AppError(404, "User not found");
  Object.assign(user, req.body);
  await user.save();
  res.json({ success: true, data: user });
}

export async function remove(req: Request, res: Response) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError(404, "User not found");
  await Promise.all([Note.deleteMany({ userId: user._id }), Post.deleteMany({ userId: user._id })]);
  res.json({ success: true, data: { message: "User and related content deleted" } });
}

export async function groupByInterests(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const result = await User.aggregate([
    { $unwind: "$interests" },
    { $project: { password: 0 } },
    { $group: { _id: "$interests", users: { $push: "$$ROOT" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      meta: [{ $count: "total" }],
    } },
  ]);
  const data = result[0]?.data ?? [];
  const total = result[0]?.meta[0]?.total ?? 0;
  res.json({ success: true, data, pagination: paginationMeta(page, limit, total) });
}

export async function posts(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const data = await User.aggregate([
    { $match: { _id: new Types.ObjectId(String(req.params.id)) } },
    { $lookup: { from: "posts", let: { ownerId: "$_id" }, pipeline: [
      { $match: { $expr: { $eq: ["$userId", "$$ownerId"] } } },
      { $sort: { createdAt: -1 } },
      { $facet: { data: [{ $skip: skip }, { $limit: limit }], meta: [{ $count: "total" }] } },
    ], as: "postResults" } },
    { $set: {
      posts: { $ifNull: [{ $arrayElemAt: ["$postResults.data", 0] }, []] },
      postTotal: { $ifNull: [{ $arrayElemAt: ["$postResults.meta.total", 0] }, 0] },
    } },
    { $unset: "postResults" },
    { $project: { password: 0, "posts.__v": 0 } },
  ]);
  if (!data[0]) throw new AppError(404, "User not found");
  const total = data[0].postTotal as number;
  delete data[0].postTotal;
  res.json({ success: true, data: data[0], pagination: paginationMeta(page, limit, total) });
}
