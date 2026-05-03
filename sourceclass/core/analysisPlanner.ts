import { AnalysisPlan, FileRoleRecord, ProjectScan, SourceClassConfig, SourceClassMode } from "./types.js";
import { estimateFileTokens } from "./tokenEstimator.js";

const modeFileLimits: Record<SourceClassMode, number> = {
  normal: 12,
  pro: 24,
  ultimate: 36,
  master: 44,
  enterprise: 54,
  education: 28
};

const roleWeights: Record<string, number> = {
  "entry-point": 100,
  config: 80,
  api: 75,
  database: 74,
  model: 68,
  utility: 60,
  "security-sensitive": 90,
  "build-script": 55,
  test: 35,
  documentation: 50,
  ui: 58,
  unknown: 20
};

export function createAnalysisPlan(
  scan: ProjectScan,
  roles: FileRoleRecord[],
  config: SourceClassConfig
): AnalysisPlan {
  const roleByPath = new Map(roles.map((record) => [record.path, record]));
  const limit = modeFileLimits[config.mode];
  const scored = scan.files
    .map((file) => {
      const role = roleByPath.get(file.path)?.role ?? "unknown";
      let score = roleWeights[role] ?? 20;
      if (scan.entryPoints.includes(file.path)) score += 40;
      if (scan.readmeFile === file.path) score += 30;
      if (scan.configFiles.includes(file.path)) score += 20;
      if ((file.lineCount ?? 0) > 800) score -= 15;
      if (file.sizeKB > config.maxFileSizeKB * 0.75) score -= 10;
      return { file, role, score };
    })
    .sort((a, b) => b.score - a.score || a.file.path.localeCompare(b.file.path));

  const importantFiles = scored.slice(0, limit).map((item) => item.file.path);
  const deepAnalysisFiles = scored
    .filter((item) => item.role !== "documentation" || item.file.path === scan.readmeFile)
    .slice(0, Math.ceil(limit * 0.6))
    .map((item) => item.file.path);
  const summarizedFiles = scored.slice(limit, limit + 80).map((item) => item.file.path);
  const securityReviewFiles = roles
    .filter((record) => record.role === "security-sensitive" || /auth|token|secret|permission|env/i.test(record.path))
    .map((record) => record.path)
    .slice(0, 50);
  const learningPathFiles = scored
    .filter((item) => ["entry-point", "config", "model", "api", "utility", "documentation"].includes(item.role))
    .slice(0, 18)
    .map((item) => item.file.path);
  const tokenEstimate = importantFiles.reduce((sum, filePath) => {
    const file = scan.files.find((candidate) => candidate.path === filePath);
    return sum + estimateFileTokens(file?.sizeKB ?? 0);
  }, 0);

  const notes = [
    `Mode '${config.mode}' selected ${importantFiles.length} important files for first-pass analysis.`,
    "Hidden files and secret-like files are skipped by default.",
    "Large and binary files are represented as skipped metadata instead of being sent to AI providers."
  ];

  if (config.mode === "enterprise") {
    notes.push("Enterprise mode adds security review notes but is not a professional security audit.");
  }

  return {
    mode: config.mode,
    languages: config.language,
    importantFiles,
    deepAnalysisFiles,
    summarizedFiles,
    skippedFiles: scan.ignored,
    securityReviewFiles,
    learningPathFiles,
    tokenEstimate,
    notes
  };
}
