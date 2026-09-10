import { describe, expect, it } from "vitest";
import { parsePagination } from "../src/utils/pagination";

describe("parsePagination", () => {
  it("uses safe defaults", () => expect(parsePagination({})).toEqual({ page: 1, limit: 10, skip: 0 }));
  it("calculates skip", () => expect(parsePagination({ page: "3", limit: "20" })).toEqual({ page: 3, limit: 20, skip: 40 }));
  it.each([{ page: "0" }, { page: "1.5" }, { limit: "0" }, { limit: "101" }, { limit: "x" }])(
    "rejects invalid input %o", (query) => expect(() => parsePagination(query)).toThrow(),
  );
});
