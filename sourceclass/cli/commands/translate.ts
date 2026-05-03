import { Command } from "commander";
import { analyzeAndWrite } from "../../core/analysisEngine.js";
import { loadConfig } from "../../utils/config.js";
import { logger } from "../../utils/logger.js";
import { mergeCliConfig, startTask } from "../commandUtils.js";

export function registerTranslateCommand(program: Command): void {
  program
    .command("translate")
    .argument("<path>", "Project path to summarize in Korean, English, and Japanese")
    .description("Generate multilingual SourceClass documentation pages")
    .option("--lang <languages>", "ko, en, ja, comma-separated values, or all")
    .option("--output <dir>", "Output directory")
    .option("--ai", "Use configured AI provider for enrichment")
    .action(async (target: string, options: { lang?: string; output?: string; ai?: boolean }) => {
      const baseConfig = await loadConfig(process.cwd());
      const config = mergeCliConfig(baseConfig, { lang: options.lang ?? "all", output: options.output });
      const spinner = startTask("Generating multilingual documentation");
      const result = await analyzeAndWrite(target, config, { ai: options.ai === true, cwd: process.cwd() });
      spinner.succeed("Generated multilingual documentation");
      logger.info(`Korean: ${result.output.outputDir}\\languages\\ko.md`);
      logger.info(`English: ${result.output.outputDir}\\languages\\en.md`);
      logger.info(`Japanese: ${result.output.outputDir}\\languages\\ja.md`);
    });
}
