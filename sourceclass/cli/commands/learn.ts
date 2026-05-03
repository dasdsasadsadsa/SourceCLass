import { Command } from "commander";
import { analyzeAndWrite } from "../../core/analysisEngine.js";
import { loadConfig } from "../../utils/config.js";
import { logger } from "../../utils/logger.js";
import { mergeCliConfig, startTask } from "../commandUtils.js";

export function registerLearnCommand(program: Command): void {
  program
    .command("learn")
    .argument("<path>", "Project path")
    .description("Generate a beginner-friendly learning curriculum")
    .option("--lang <languages>", "ko, en, ja, comma-separated values, or all")
    .option("--output <dir>", "Output directory")
    .action(async (target: string, options: { lang?: string; output?: string }) => {
      const baseConfig = await loadConfig(process.cwd());
      const config = mergeCliConfig(baseConfig, { lang: options.lang, output: options.output, mode: "education" });
      const spinner = startTask("Generating learning curriculum");
      const result = await analyzeAndWrite(target, config, { ai: false, cwd: process.cwd() });
      spinner.succeed("Generated learning path");
      logger.info(`Learning path: ${result.output.outputDir}\\08-learning-path.md`);
      logger.info(`Korean: ${result.output.outputDir}\\languages\\ko.md`);
      logger.info(`English: ${result.output.outputDir}\\languages\\en.md`);
      logger.info(`Japanese: ${result.output.outputDir}\\languages\\ja.md`);
    });
}
