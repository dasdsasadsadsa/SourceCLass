import fg from "fast-glob";
import fs from "fs-extra";
import path from "node:path";
import { SourceClassConfig, ProjectFile, ProjectScan, IgnoredPath } from "./types.js";
import { detectLanguage } from "./languageDetector.js";
import { countLines, isHiddenPath, isLikelySecretPath, normalizeSlash } from "../utils/fs.js";

const DEFAULT_IGNORES = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "build/**",
  ".next/**",
  ".nuxt/**",
  ".svelte-kit/**",
  ".venv/**",
  "venv/**",
  "__pycache__/**",
  ".pytest_cache/**",
  ".mypy_cache/**",
  "coverage/**",
  "target/**",
  "bin/**",
  "obj/**",
  ".sourceclass/**"
];

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
  ".rar",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".class",
  ".jar",
  ".wasm",
  ".mp3",
  ".mp4",
  ".mov",
  ".avi",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf"
]);

const CONFIG_FILE_NAMES = new Set([
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "vite.config.js",
  "next.config.js",
  "next.config.mjs",
  "pyproject.toml",
  "requirements.txt",
  "poetry.lock",
  "Cargo.toml",
  "go.mod",
  "pom.xml",
  "build.gradle",
  "settings.gradle",
  "Dockerfile",
  "docker-compose.yml",
  "Makefile"
]);

export async function scanProject(projectPath: string, config: SourceClassConfig): Promise<ProjectScan> {
  const root = path.resolve(projectPath);
  const exists = await fs.pathExists(root);

  if (!exists) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }

  const stat = await fs.stat(root);
  if (!stat.isDirectory()) {
    throw new Error(`Project path must be a directory: ${projectPath}`);
  }

  const ignore = buildIgnoreList(config);
  const entries = await fg(["**/*"], {
    cwd: root,
    dot: true,
    onlyFiles: true,
    followSymbolicLinks: false,
    ignore
  });

  const files: ProjectFile[] = [];
  const ignored: IgnoredPath[] = [];

  for (const entry of entries.sort()) {
    const normalized = normalizeSlash(entry);
    const absolutePath = path.join(root, normalized);

    if (!config.includeHidden && isHiddenPath(normalized)) {
      if (path.basename(normalized) === ".env.example") {
        // Keep metadata for env examples because they are useful and should not contain real secrets.
      } else {
        ignored.push({ path: normalized, reason: "hidden file or folder" });
        continue;
      }
    }

    if (isLikelySecretPath(normalized)) {
      ignored.push({ path: normalized, reason: "secret-like path skipped by default" });
      continue;
    }

    const fileStat = await fs.stat(absolutePath);
    const extension = path.extname(normalized).toLowerCase();
    const sizeKB = Math.round((fileStat.size / 1024) * 10) / 10;

    if (BINARY_EXTENSIONS.has(extension)) {
      ignored.push({ path: normalized, reason: "binary or media file" });
      continue;
    }

    if (sizeKB > config.maxFileSizeKB) {
      ignored.push({ path: normalized, reason: `larger than ${config.maxFileSizeKB}KB` });
      continue;
    }

    const isBinary = await containsNullByte(absolutePath);
    if (isBinary) {
      ignored.push({ path: normalized, reason: "binary content detected" });
      continue;
    }

    const language = detectLanguage(normalized);
    files.push({
      path: normalized,
      absolutePath,
      extension,
      language,
      sizeKB,
      isText: true,
      isBinary: false,
      lineCount: await countLines(absolutePath)
    });

    if (files.length >= config.maxFiles) {
      ignored.push({ path: "**/*", reason: `max file limit reached (${config.maxFiles})` });
      break;
    }
  }

  const languages = files.reduce<Record<string, number>>((acc, file) => {
    acc[file.language] = (acc[file.language] ?? 0) + 1;
    return acc;
  }, {});

  const scan: ProjectScan = {
    root,
    generatedAt: new Date().toISOString(),
    files,
    ignored,
    languages,
    frameworks: await detectFrameworks(root, files),
    packageManagers: detectPackageManagers(files),
    entryPoints: await detectEntryPoints(root, files),
    readmeFile: files.find((file) => /^readme(\.|$)/i.test(path.basename(file.path)))?.path,
    licenseFile: files.find((file) => /^licen[sc]e(\.|$)/i.test(path.basename(file.path)))?.path,
    testFiles: files.filter((file) => isTestPath(file.path)).map((file) => file.path),
    envExampleFiles: files.filter((file) => path.basename(file.path) === ".env.example" || file.path.endsWith(".env.example")).map((file) => file.path),
    configFiles: files.filter((file) => CONFIG_FILE_NAMES.has(path.basename(file.path))).map((file) => file.path),
    buildScripts: files.filter((file) => isBuildScript(file.path)).map((file) => file.path),
    stats: {
      totalFiles: entries.length,
      readableFiles: files.length,
      ignoredFiles: ignored.length,
      totalSizeKB: Math.round(files.reduce((sum, file) => sum + file.sizeKB, 0) * 10) / 10
    }
  };

  return scan;
}

function buildIgnoreList(config: SourceClassConfig): string[] {
  const configured = config.ignore.flatMap((value) => {
    const normalized = normalizeSlash(value).replace(/\/$/, "");
    return normalized.includes("*") ? [normalized] : [`${normalized}/**`, normalized];
  });

  return [...DEFAULT_IGNORES, ...configured];
}

async function containsNullByte(filePath: string): Promise<boolean> {
  const handle = await fs.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(512);
    const { bytesRead } = await fs.read(handle, buffer, 0, buffer.length, 0);
    return buffer.subarray(0, bytesRead).includes(0);
  } finally {
    await fs.close(handle);
  }
}

function detectPackageManagers(files: ProjectFile[]): string[] {
  const paths = new Set(files.map((file) => file.path));
  const managers = new Set<string>();

  if (paths.has("package.json")) managers.add("npm");
  if (paths.has("package-lock.json")) managers.add("npm");
  if (paths.has("pnpm-lock.yaml")) managers.add("pnpm");
  if (paths.has("yarn.lock")) managers.add("yarn");
  if (paths.has("bun.lockb")) managers.add("bun");
  if (paths.has("requirements.txt") || paths.has("pyproject.toml")) managers.add("python");
  if (paths.has("Cargo.toml")) managers.add("cargo");
  if (paths.has("go.mod")) managers.add("go");
  if (paths.has("pom.xml")) managers.add("maven");
  if (paths.has("build.gradle") || paths.has("build.gradle.kts")) managers.add("gradle");

  return managers.size > 0 ? [...managers] : ["unknown"];
}

async function detectFrameworks(root: string, files: ProjectFile[]): Promise<string[]> {
  const frameworks = new Set<string>();
  const packageFile = files.find((file) => file.path === "package.json");

  if (packageFile) {
    try {
      const packageJson = await fs.readJson(path.join(root, packageFile.path));
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      for (const name of Object.keys(deps)) {
        if (["react", "next", "vue", "svelte", "express", "fastify", "nestjs", "@nestjs/core", "vite"].includes(name)) {
          frameworks.add(name === "@nestjs/core" ? "nestjs" : name);
        }
      }
    } catch {
      // Ignore malformed package files during detection.
    }
  }

  const paths = files.map((file) => file.path.toLowerCase());
  if (paths.includes("pyproject.toml")) frameworks.add("python");
  if (paths.some((value) => value.includes("django"))) frameworks.add("django");
  if (paths.some((value) => value.includes("fastapi"))) frameworks.add("fastapi");
  if (paths.includes("cargo.toml")) frameworks.add("rust");
  if (paths.includes("go.mod")) frameworks.add("go");
  if (paths.some((value) => value.endsWith(".csproj"))) frameworks.add(".NET");
  if (paths.includes("pubspec.yaml")) frameworks.add("flutter/dart");

  return [...frameworks];
}

async function detectEntryPoints(root: string, files: ProjectFile[]): Promise<string[]> {
  const entryPoints = new Set<string>();
  const paths = new Set(files.map((file) => file.path));
  const common = [
    "src/main.ts",
    "src/main.tsx",
    "src/index.ts",
    "src/index.tsx",
    "src/main.js",
    "src/index.js",
    "main.py",
    "app.py",
    "src/main.py",
    "cmd/main.go",
    "main.go",
    "src/main.rs",
    "Program.cs"
  ];

  for (const candidate of common) {
    if (paths.has(candidate)) {
      entryPoints.add(candidate);
    }
  }

  if (paths.has("package.json")) {
    try {
      const packageJson = await fs.readJson(path.join(root, "package.json"));
      if (typeof packageJson.main === "string" && paths.has(packageJson.main)) {
        entryPoints.add(packageJson.main);
      }
      if (typeof packageJson.bin === "string" && paths.has(packageJson.bin)) {
        entryPoints.add(packageJson.bin);
      }
      if (packageJson.bin && typeof packageJson.bin === "object") {
        Object.values(packageJson.bin)
          .filter((value): value is string => typeof value === "string")
          .forEach((value) => {
            if (paths.has(value)) {
              entryPoints.add(value);
            }
          });
      }
    } catch {
      // Keep best-effort entry detection.
    }
  }

  return [...entryPoints];
}

function isTestPath(filePath: string): boolean {
  return /(^|\/)(__tests__|tests?|spec)(\/|$)/i.test(filePath) || /\.(test|spec)\.[cm]?[jt]sx?$/i.test(filePath);
}

function isBuildScript(filePath: string): boolean {
  const base = path.basename(filePath);
  return ["Dockerfile", "Makefile", "docker-compose.yml", "docker-compose.yaml"].includes(base) || /(^|\/)scripts?\//i.test(filePath);
}
