import { describe, expect, it } from "vitest";
import { sourceClassConfigSchema } from "../sourceclass/core/types.js";

describe("config schema", () => {
  it("provides safe defaults", () => {
    const config = sourceClassConfigSchema.parse({});
    expect(config.provider).toBe("openai");
    expect(config.language).toEqual(["ko", "en", "ja"]);
    expect(config.mode).toBe("ultimate");
    expect(config.outputDir).toBe("sourceclass-output");
  });
});
