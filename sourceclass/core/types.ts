import { z } from "zod";

export const providerNames = ["openai", "anthropic", "gemini", "openrouter", "local"] as const;
export type ProviderName = (typeof providerNames)[number];

export const languageCodes = ["ko", "en", "ja"] as const;
export type LanguageCode = (typeof languageCodes)[number];

export const sourceClassModes = [
  "normal",
  "pro",
  "ultimate",
  "master",
  "enterprise",
  "education"
] as const;
export type SourceClassMode = (typeof sourceClassModes)[number];

export const fileRoles = [
  "entry-point",
  "config",
  "ui",
  "api",
  "database",
  "model",
  "utility",
  "test",
  "documentation",
  "build-script",
  "security-sensitive",
  "unknown"
] as const;
export type FileRole = (typeof fileRoles)[number];

const providerApiKeysSchema = z
  .object({
    openai: z.string().optional(),
    anthropic: z.string().optional(),
    gemini: z.string().optional(),
    openrouter: z.string().optional(),
    local: z.string().optional()
  })
  .partial();

export const sourceClassConfigSchema = z.object({
  provider: z.enum(providerNames).default("openai"),
  model: z.string().min(1).default("gpt-4.1"),
  language: z.array(z.enum(languageCodes)).default(["ko", "en", "ja"]),
  mode: z.enum(sourceClassModes).default("ultimate"),
  outputDir: z.string().min(1).default("sourceclass-output"),
  maxFileSizeKB: z.number().int().positive().default(300),
  maxFiles: z.number().int().positive().default(400),
  ignore: z.array(z.string()).default([
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    ".venv",
    "__pycache__"
  ]),
  securityMode: z.boolean().default(false),
  includeHidden: z.boolean().default(false),
  localEndpoint: z.string().url().optional(),
  apiKeys: providerApiKeysSchema.optional()
});

export type SourceClassConfig = z.infer<typeof sourceClassConfigSchema>;

export interface IgnoredPath {
  path: string;
  reason: string;
}

export interface ProjectFile {
  path: string;
  absolutePath: string;
  extension: string;
  language: string;
  sizeKB: number;
  isText: boolean;
  isBinary: boolean;
  lineCount?: number;
  role?: FileRole;
}

export interface ProjectScan {
  root: string;
  generatedAt: string;
  files: ProjectFile[];
  ignored: IgnoredPath[];
  languages: Record<string, number>;
  frameworks: string[];
  packageManagers: string[];
  entryPoints: string[];
  readmeFile?: string;
  licenseFile?: string;
  testFiles: string[];
  envExampleFiles: string[];
  configFiles: string[];
  buildScripts: string[];
  stats: {
    totalFiles: number;
    readableFiles: number;
    ignoredFiles: number;
    totalSizeKB: number;
  };
}

export interface FileRoleRecord {
  path: string;
  role: FileRole;
  confidence: number;
  reasons: string[];
  language: string;
}

export interface ImportRecord {
  file: string;
  imports: string[];
}

export interface DependencyMap {
  packageManagers: string[];
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  imports: ImportRecord[];
}

export interface AnalysisPlan {
  mode: SourceClassMode;
  languages: LanguageCode[];
  importantFiles: string[];
  deepAnalysisFiles: string[];
  summarizedFiles: string[];
  skippedFiles: IgnoredPath[];
  securityReviewFiles: string[];
  learningPathFiles: string[];
  tokenEstimate: number;
  notes: string[];
}

export interface FileChunk {
  filePath: string;
  chunkIndex: number;
  totalChunks: number;
  startLine: number;
  endLine: number;
  estimatedTokens: number;
  content: string;
}

export interface FileAnalysis {
  filePath: string;
  content: string;
  generatedBy: "ai" | "local";
}

export interface ReportContext {
  scan: ProjectScan;
  roles: FileRoleRecord[];
  dependencies: DependencyMap;
  plan: AnalysisPlan;
  config: SourceClassConfig;
  aiProjectAnalysis?: string;
  fileAnalyses?: FileAnalysis[];
}
