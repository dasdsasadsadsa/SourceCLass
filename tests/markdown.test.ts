import { describe, expect, it } from "vitest";
import { fenced, table } from "../sourceclass/utils/markdown.js";

describe("markdown helpers", () => {
  it("escapes table pipes", () => {
    expect(table(["A"], [["x|y"]])).toContain("x\\|y");
  });

  it("protects fenced blocks", () => {
    expect(fenced("md", "```")).toContain("'''");
  });
});
