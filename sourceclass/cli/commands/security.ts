import { Command } from "commander";
import { analyzeAndWrite } from "../../core/analysisEngine.js";
import { loadConfig } from "../../utils/config.js";
import { logger } from "../../utils/logger.js";
import { mergeCliConfig, startTask } from "../commandUtils.js";

export function registerSecurityCommand(program: Command): void {
  program
    .command("security")
    .argument("<path>", "Project path")
    .description("Generate security-oriented SourceClass notes")
    .option("--output <dir>", "Output directory")
    .option("--ai", "Use configured AI provider for enrichment")
    .action(async (target: string, options: { output?: string; ai?: boolean }) => {
      const baseConfig = await loadConfig(process.cwd());
      const config = mergeCliConfig(baseConfig, { output: options.output, mode: "enterprise" });
      const spinner = startTask("Generating security notes");
      const result = await analyzeAndWrite(target, config, { ai: options.ai === true, cwd: process.cwd() });
      spinner.succeed("Generated security notes");
      logger.info(`Security notes: ${result.output.outputDir}\\11-security-notes.md`);
      logger.warn("Enterprise/security output is not a replacement for a professional security audit.");
    });
}
