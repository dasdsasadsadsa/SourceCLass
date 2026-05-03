import path from "node:path";
import { FileRole, FileRoleRecord, ProjectFile, ProjectScan } from "./types.js";

export function classifyFiles(scan: ProjectScan): FileRoleRecord[] {
  return scan.files.map((file) => classifyFile(file, scan));
}

export function classifyFile(file: ProjectFile, scan: ProjectScan): FileRoleRecord {
  const normalized = file.path.replace(/\\/g, "/");
  const lower = normalized.toLowerCase();
  const base = path.basename(lower);
  const reasons: string[] = [];
  let role: FileRole = "unknown";
  let confidence = 0.4;

  if (scan.entryPoints.includes(file.path) || /(^|\/)(main|index|app|server|cli)\.[cm]?[jt]sx?$/.test(lower)) {
    role = "entry-point";
    confidence = 0.9;
    reasons.push("matches detected entry point pattern");
  } else if (isSecuritySensitive(lower)) {
    role = "security-sensitive";
    confidence = 0.85;
    reasons.push("path suggests authentication, secrets, permissions, or cryptography");
  } else if (isConfig(base)) {
    role = "config";
    confidence = 0.9;
    reasons.push("known configuration file");
  } else if (isTest(lower)) {
    role = "test";
    confidence = 0.9;
    reasons.push("test filename or folder pattern");
  } else if (file.language === "Markdown") {
    role = "documentation";
    confidence = 0.85;
    reasons.push("markdown documentation");
  } else if (isBuildScript(lower, base)) {
    role = "build-script";
    confidence = 0.85;
    reasons.push("build, script, Docker, or automation path");
  } else if (/(^|\/)(api|routes|controllers|handlers|server)(\/|$)/.test(lower)) {
    role = "api";
    confidence = 0.78;
    reasons.push("API route/controller/server folder pattern");
  } else if (/(^|\/)(db|database|prisma|migrations|repositories)(\/|$)/.test(lower)) {
    role = "database";
    confidence = 0.78;
    reasons.push("database or persistence folder pattern");
  } else if (/(^|\/)(models|entities|schemas|domain)(\/|$)/.test(lower)) {
    role = "model";
    confidence = 0.72;
    reasons.push("model/entity/schema folder pattern");
  } else if (/(^|\/)(components|pages|views|screens|ui)(\/|$)/.test(lower) || /\.(tsx|jsx|vue|svelte)$/.test(lower)) {
    role = "ui";
    confidence = 0.7;
    reasons.push("UI folder or component extension pattern");
  } else if (/(^|\/)(utils?|helpers?|lib|common|shared)(\/|$)/.test(lower)) {
    role = "utility";
    confidence = 0.68;
    reasons.push("utility/helper/shared folder pattern");
  }

  if (reasons.length === 0) {
    reasons.push("no strong role pattern detected");
  }

  file.role = role;
  return {
    path: file.path,
    role,
    confidence,
    reasons,
    language: file.language
  };
}

function isConfig(base: string): boolean {
  return [
    "package.json",
    "tsconfig.json",
    "jsconfig.json",
    "vite.config.ts",
    "vite.config.js",
    "next.config.js",
    "next.config.mjs",
    "pyproject.toml",
    "cargo.toml",
    "go.mod",
    "pom.xml",
    "build.gradle",
    "build.gradle.kts",
    "settings.gradle",
    "requirements.txt",
    "docker-compose.yml",
    "docker-compose.yaml",
    "tailwind.config.js",
    "postcss.config.js"
  ].includes(base);
}

function isTest(value: string): boolean {
  return /(^|\/)(__tests__|tests?|spec)(\/|$)/.test(value) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(value);
}

function isBuildScript(value: string, base: string): boolean {
  return ["dockerfile", "makefile"].includes(base) || /(^|\/)scripts?\//.test(value) || /\.(sh|ps1|bat)$/.test(value);
}

function isSecuritySensitive(value: string): boolean {
  return /(^|\/)(auth|security|crypto|permissions?|middleware|session|jwt|oauth|secrets?)(\/|$)/.test(value) ||
    /(auth|token|secret|password|permission|crypto|jwt|oauth)/.test(value);
}
