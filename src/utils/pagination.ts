import { AppError } from "./app-error";

export interface Pagination { page: number; limit: number; skip: number }

export function parsePagination(query: Record<string, unknown>): Pagination {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);

  if (!Number.isInteger(page) || page < 1) throw new AppError(400, "page must be a positive integer");
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError(400, "limit must be an integer between 1 and 100");
  }
  return { page, limit, skip: (page - 1) * limit };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
