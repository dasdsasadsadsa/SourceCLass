import fs from "fs-extra";
import path from "node:path";
import { Command } from "commander";
import { createProvider } from "../../ai/providerFactory.js";
import { baseSystemPrompt } from "../../prompts/system/base.js";
import { ProjectFile, ProjectScan } from "../../core/types.js";
import { classifyFile } from "../../core/fileClassifier.js";
import { detectLanguage } from "../../core/languageDetector.js";
import { chunkFile } from "../../core/chunker.js";
import { loadConfig, resolveApiKey, SOURCECLASS_DIR } from "../../utils/config.js";
import { readTextSafe, redactSecrets, writeText } from "../../utils/fs.js";
import { fenced } from "../../utils/markdown.js";
import { logger } from "../../utils/logger.js";
import { startTask } from "../commandUtils.js";

export function registerExplainCommand(program: Command): void {
  program
    .command("explain")
    .argument("<file>", "File to explain")
    .description("Explain a single source file")
    .option("--no-ai", "Generate local explanation without provider calls")
    .action(async (filePath: string, options: { ai?: boolean }) => {
      const absolutePath = path.resolve(filePath);
      if (!(await fs.pathExists(absolutePath))) {
        throw new Error(`File does not exist: ${filePath}`);
      }

      const config = await loadConfig(process.cwd());
      const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");
      const stat = await fs.stat(absolutePath);
      const file: ProjectFile = {
        path: relativePath,
        absolutePath,
        extension: path.extname(relativePath),
        language: detectLanguage(relativePath),
        sizeKB: Math.round((stat.size / 1024) * 10) / 10,
        isText: true,
        isBinary: false
      };
      const scan = minimalScan(process.cwd(), file);
      const role = classifyFile(file, scan);
      const chunks = await chunkFile(file, { maxTokens: 1800 });
      const firstChunk = chunks[0]?.content ?? redactSecrets(await readTextSafe(absolutePath));
      let explanation = localFileExplanation(file, role.reasons);

      if (options.ai !== false) {
        const spinner = startTask("Explaining file with configured provider");
        const apiKey = await resolveApiKey(config.provider, config, process.cwd());
        if (!apiKey && config.provider !== "local") {
          spinner.warn("No API key found; using local file explanation");
        } else {
          try {
            const provider = createProvider({ config, apiKey });
            const response = await provider.generate({
              model: config.model,
              temperature: 0.2,
              maxTokens: 2200,
              messages: [
                { role: "system", content: baseSystemPrompt },
                {
                  role: "user",
                  content: `Explain this file for SourceClass.\n\nReturn sections for file purpose, responsibilities, important structures, inputs/outputs, dependencies, safe modifications, dangerous modifications, possible errors, and learning keywords.\n\nFile: ${relativePath}\nRole: ${role.role}\n\n${fenced(file.language.toLowerCase(), firstChunk)}`
                }
              ]
            });
            explanation = response.text;
            spinner.succeed("Generated AI file explanation");
          } catch (error) {
            spinner.warn(`Provider failed; using local explanation (${error instanceof Error ? error.message : String(error)})`);
          }
        }
      }

      const reportPath = path.join(process.cwd(), SOURCECLASS_DIR, "reports", `${path.basename(relativePath)}.md`);
      await writeText(reportPath, explanation);
      logger.info(explanation);
      logger.success(`Saved report: ${reportPath}`);
    });
}

function minimalScan(root: string, file: ProjectFile): ProjectScan {
  return {
    root,
    generatedAt: new Date().toISOString(),
    files: [file],
    ignored: [],
    languages: { [file.language]: 1 },
    frameworks: [],
    packageManagers: ["unknown"],
    entryPoints: [],
    testFiles: [],
    envExampleFiles: [],
    configFiles: [],
    buildScripts: [],
    stats: {
      totalFiles: 1,
      readableFiles: 1,
      ignoredFiles: 0,
      totalSizeKB: file.sizeKB
    }
  };
}

function localFileExplanation(file: ProjectFile, reasons: string[]): string {
  return `# ${file.path}

## File Purpose

SourceClass classified this file as \`${file.role ?? "unknown"}\` using local path and language heuristics.

## Metadata

- Language: \`${file.language}\`
- Size: \`${file.sizeKB}KB\`
- Reason: ${reasons.join("; ")}

## Beginner Reading Advice

1. Read imports or dependencies first.
2. Identify exported functions, classes, constants, or commands.
3. Write down what this file receives as input and what it returns or changes.
4. Search for other files that import or call this file.

Configure an AI provider to get deeper file-level explanation.
`;
}
