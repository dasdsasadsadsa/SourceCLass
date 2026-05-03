import fs from "fs-extra";
import path from "node:path";
import { DependencyMap, ProjectScan } from "./types.js";
import { readTextSafe } from "../utils/fs.js";

const IMPORT_PATTERNS = [
  /import\s+(?:.+?\s+from\s+)?["']([^"']+)["']/g,
  /require\(["']([^"']+)["']\)/g,
  /from\s+["']([^"']+)["']\s+import/g,
  /using\s+([A-Za-z0-9_.]+);/g
];

export async function mapDependencies(scan: ProjectScan): Promise<DependencyMap> {
  const dependencies = new Set<string>();
  const devDependencies = new Set<string>();
  const scripts: Record<string, string> = {};

  const packageFile = scan.files.find((file) => file.path === "package.json");
  if (packageFile) {
    try {
      const packageJson = await fs.readJson(packageFile.absolutePath);
      Object.keys(packageJson.dependencies ?? {}).forEach((dep) => dependencies.add(dep));
      Object.keys(packageJson.devDependencies ?? {}).forEach((dep) => devDependencies.add(dep));
      Object.assign(scripts, packageJson.scripts ?? {});
    } catch {
      // Dependency mapping is best effort.
    }
  }

  await readPythonRequirements(scan, dependencies);
  await readCargoDependencies(scan, dependencies, devDependencies);

  const imports = [];
  const importCandidates = scan.files.filter((file) =>
    [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".cs"].includes(path.extname(file.path).toLowerCase())
  );

  for (const file of importCandidates.slice(0, 200)) {
    const content = await readTextSafe(file.absolutePath, 96_000);
    const values = new Set<string>();

    for (const pattern of IMPORT_PATTERNS) {
      let match: RegExpExecArray | null;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          values.add(match[1]);
        }
      }
    }

    if (values.size > 0) {
      imports.push({ file: file.path, imports: [...values].slice(0, 50) });
    }
  }

  return {
    packageManagers: scan.packageManagers,
    dependencies: [...dependencies].sort(),
    devDependencies: [...devDependencies].sort(),
    scripts,
    imports
  };
}

async function readPythonRequirements(scan: ProjectScan, dependencies: Set<string>): Promise<void> {
  const requirements = scan.files.find((file) => file.path === "requirements.txt");
  if (!requirements) {
    return;
  }

  const content = await readTextSafe(requirements.absolutePath, 96_000);
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/[<>=~!]/)[0]?.trim())
    .filter(Boolean)
    .forEach((dep) => dependencies.add(dep));
}

async function readCargoDependencies(
  scan: ProjectScan,
  dependencies: Set<string>,
  devDependencies: Set<string>
): Promise<void> {
  const cargo = scan.files.find((file) => file.path === "Cargo.toml");
  if (!cargo) {
    return;
  }

  const content = await readTextSafe(cargo.absolutePath, 96_000);
  let section: "dependencies" | "devDependencies" | undefined;

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "[dependencies]") section = "dependencies";
    else if (trimmed === "[dev-dependencies]") section = "devDependencies";
    else if (trimmed.startsWith("[") && trimmed.endsWith("]")) section = undefined;
    else if (section && /^[A-Za-z0-9_-]+\s*=/.test(trimmed)) {
      const name = trimmed.split("=")[0]?.trim();
      if (name) {
        (section === "dependencies" ? dependencies : devDependencies).add(name);
      }
    }
  }
}
