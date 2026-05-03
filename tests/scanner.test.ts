import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../sourceclass/utils/config.js";
import { scanProject } from "../sourceclass/core/projectScanner.js";

describe("scanProject", () => {
  it("ignores dependencies and detects package metadata", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "sourceclass-scan-"));
    await fs.ensureDir(path.join(dir, "src"));
    await fs.ensureDir(path.join(dir, "node_modules", "pkg"));
    await fs.writeJson(path.join(dir, "package.json"), {
      scripts: { start: "node src/index.js" },
      dependencies: { express: "^4.18.0" }
    });
    await fs.writeFile(path.join(dir, "src", "index.js"), "console.log('hello');", "utf8");
    await fs.writeFile(path.join(dir, "node_modules", "pkg", "index.js"), "ignored", "utf8");

    const scan = await scanProject(dir, DEFAULT_CONFIG);

    expect(scan.files.map((file) => file.path)).toContain("package.json");
    expect(scan.files.map((file) => file.path)).toContain("src/index.js");
    expect(scan.files.map((file) => file.path)).not.toContain("node_modules/pkg/index.js");
    expect(scan.packageManagers).toContain("npm");
  });
});
