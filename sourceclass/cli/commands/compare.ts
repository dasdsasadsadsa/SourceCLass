import { Command } from "commander";
import { analyzeAndWrite } from "../../core/analysisEngine.js";
import { loadConfig } from "../../utils/config.js";
import { logger } from "../../utils/logger.js";
import { mergeCliConfig, startTask } from "../commandUtils.js";

export function registerCompareCommand(program: Command): void {
  program
    .command("compare")
    .argument("<path>", "Project path")
    .description("Generate safe open-source comparison guidance")
    .option("--license <license>", "Preferred license filter, for example MIT")
    .option("--github", "Include GitHub search query guidance")
    .option("--output <dir>", "Output directory")
    .action(async (target: string, options: { output?: string; license?: string; github?: boolean }) => {
      const baseConfig = await loadConfig(process.cwd());
      const config = mergeCliConfig(baseConfig, { output: options.output, mode: "ultimate" });
      const spinner = startTask("Generating comparison guidance");
      const result = await analyzeAndWrite(target, config, { ai: false, cwd: process.cwd() });
      spinner.succeed("Generated open-source comparison guide");
      logger.info(`Comparison: ${result.output.outputDir}\\10-open-source-comparison.md`);
      if (options.license) {
        logger.muted(`Preferred license filter: ${options.license}`);
      }
      if (options.github) {
        logger.muted("Use the suggested GitHub queries in the comparison guide. SourceClass does not aggressively crawl repositories.");
      }
    });
}
