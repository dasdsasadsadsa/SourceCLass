import fs from "fs-extra";
import path from "node:path";
import { AnalysisPlan, DependencyMap, FileRoleRecord, ProjectScan } from "./types.js";
import { generateReports } from "./reportGenerator.js";
import { ReportContext } from "./types.js";
import { writeJson, writeText } from "../utils/fs.js";

export interface OutputResult {
  outputDir: string;
  documents: string[];
  dataFiles: string[];
  warnings: string[];
}

export async function writeGitBookOutput(context: ReportContext): Promise<OutputResult> {
  const outputDir = path.resolve(context.config.outputDir);
  await fs.ensureDir(outputDir);

  const reports = generateReports(context);
  const documents: string[] = [];

  for (const [relativePath, content] of Object.entries(reports)) {
    await writeText(path.join(outputDir, relativePath), content);
    documents.push(relativePath);
  }

  const dataFiles = await writeDataFiles(outputDir, context.scan, context.roles, context.plan, context.dependencies);
  const warnings = await validateOutput(outputDir, documents);

  return {
    outputDir,
    documents,
    dataFiles,
    warnings
  };
}

async function writeDataFiles(
  outputDir: string,
  scan: ProjectScan,
  roles: FileRoleRecord[],
  plan: AnalysisPlan,
  dependencies: DependencyMap
): Promise<string[]> {
  const dataDir = path.join(outputDir, "data");
  const files = {
    "data/project_structure.json": scan,
    "data/file_roles.json": roles,
    "data/analysis_plan.json": plan,
    "data/dependency_map.json": dependencies
  };

  await fs.ensureDir(dataDir);
  for (const [relativePath, value] of Object.entries(files)) {
    await writeJson(path.join(outputDir, relativePath), value);
  }

  return Object.keys(files);
}

async function validateOutput(outputDir: string, documents: string[]): Promise<string[]> {
  const required = [
    "README.md",
    "SUMMARY.md",
    "01-introduction.md",
    "02-project-map.md",
    "03-folder-anatomy.md",
    "04-execution-flow.md",
    "05-file-roles.md",
    "06-beginner-explanation.md",
    "07-modification-guide.md",
    "08-learning-path.md",
    "09-build-and-run.md",
    "10-open-source-comparison.md",
    "11-security-notes.md",
    "12-business-direction.md",
    "13-mind-map-navigation.md",
    "14-30-day-code-class.md",
    "languages/ko.md",
    "languages/en.md",
    "languages/ja.md"
  ];
  const warnings: string[] = [];

  for (const file of required) {
    const exists = await fs.pathExists(path.join(outputDir, file));
    if (!exists) {
      warnings.push(`Missing expected output file: ${file}`);
    }
  }

  if (!documents.includes("SUMMARY.md")) {
    warnings.push("SUMMARY.md was not registered in generated document list.");
  }

  return warnings;
}
