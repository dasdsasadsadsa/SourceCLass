import fs from "fs-extra";
import path from "node:path";

const SECRET_PATTERNS = [
  /(api[_-]?key\s*[:=]\s*)(["']?)[A-Za-z0-9_\-./+=]{12,}\2/gi,
  /(token\s*[:=]\s*)(["']?)[A-Za-z0-9_\-./+=]{12,}\2/gi,
  /(secret\s*[:=]\s*)(["']?)[A-Za-z0-9_\-./+=]{12,}\2/gi,
  /(password\s*[:=]\s*)(["']?)[^\s"']{6,}\2/gi,
  /(sk-[A-Za-z0-9]{12,})/g
];

export async function ensureDir(dir: string): Promise<void> {
  await fs.ensureDir(dir);
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJson(filePath, value, { spaces: 2 });
}

export async function writeText(filePath: string, value: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, value, "utf8");
}

export async function readJson<T>(filePath: string): Promise<T> {
  return fs.readJson(filePath) as Promise<T>;
}

export async function readTextSafe(filePath: string, maxBytes = 256_000): Promise<string> {
  const stat = await fs.stat(filePath);
  const bytesToRead = Math.min(stat.size, maxBytes);
  const handle = await fs.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(bytesToRead);
    await fs.read(handle, buffer, 0, bytesToRead, 0);
    return buffer.toString("utf8");
  } finally {
    await fs.close(handle);
  }
}

export async function countLines(filePath: string, maxBytes = 512_000): Promise<number | undefined> {
  try {
    const content = await readTextSafe(filePath, maxBytes);
    return content.split(/\r?\n/).length;
  } catch {
    return undefined;
  }
}

export function redactSecrets(content: string): string {
  return SECRET_PATTERNS.reduce((current, pattern) => {
    return current.replace(pattern, (match, prefix) => {
      if (typeof prefix === "string" && prefix.length > 0) {
        return `${prefix}[REDACTED]`;
      }

      return "[REDACTED_SECRET]";
    });
  }, content);
}

export function isLikelySecretPath(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/").toLowerCase();
  const base = path.posix.basename(normalized);

  if (base === ".env" || (base.startsWith(".env.") && !base.endsWith(".example"))) {
    return true;
  }

  return /(^|\/)(secrets?|credentials?|private-key|id_rsa|id_ed25519)(\.|\/|$)/i.test(normalized);
}

export function isHiddenPath(relativePath: string): boolean {
  return relativePath
    .replace(/\\/g, "/")
    .split("/")
    .some((segment) => segment.startsWith(".") && segment !== "." && segment !== ".env.example");
}

export function normalizeSlash(value: string): string {
  return value.replace(/\\/g, "/");
}
