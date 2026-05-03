import { describe, expect, it } from "vitest";
import { createProvider } from "../sourceclass/ai/providerFactory.js";
import { DEFAULT_CONFIG } from "../sourceclass/utils/config.js";

describe("provider factory", () => {
  it("creates a local provider", () => {
    const provider = createProvider({
      config: {
        ...DEFAULT_CONFIG,
        provider: "local",
        model: "llama3.1"
      }
    });

    expect(provider.name).toBe("local");
  });
});
