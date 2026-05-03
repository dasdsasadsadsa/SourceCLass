import { Command } from "commander";
import { analyzeAndWrite } from "../../core/analysisEngine.js";
import { loadConfig } from "../../utils/config.js";
import { logger } from "../../utils/logger.js";
import { mergeCliConfig, startTask } from "../commandUtils.js";

export function registerAnalyzeCommand(program: Command): void {
  program
    .command("analyze")
    .argument("<path>", "Project path to analyze")
    .description("Analyze a project and generate GitBook-style SourceClass documentation")
    .option("--mode <mode>", "normal, pro, ultimate, master, enterprise, or education")
    .option("--lang <languages>", "ko, en, ja, comma-separated values, or all")
    .option("--output <dir>", "Output directory")
    .option("--provider <provider>", "openai, anthropic, gemini, openrouter, or local")
    .option("--model <model>", "Provider model name")
    .option("--max-files <count>", "Maximum files to scan")
    .option("--no-ai", "Generate scanner-based docs without AI provider calls")
    .action(async (target: string, options: Record<string, string | boolean>) => {
      const baseConfig = await loadConfig(process.cwd());
      const config = mergeCliConfig(baseConfig, {
        mode: stringOption(options.mode),
        lang: stringOption(options.lang),
        output: stringOption(options.output),
        provider: stringOption(options.provider),
        model: stringOption(options.model),
        maxFiles: stringOption(options.maxFiles)
      });

      const spinner = startTask(`Analyzing project: ${target}`);
      try {
        const result = await analyzeAndWrite(target, config, { ai: options.ai !== false, cwd: process.cwd() });
        spinner.succeed("Generated GitBook-style documentation");
        logger.section("SourceClass Summary");
        logger.success(`Scanned ${result.context.scan.stats.readableFiles} readable files`);
        logger.success(`Ignored or skipped ${result.context.scan.stats.ignoredFiles} paths`);
        logger.success(`Detected stack: ${result.context.scan.frameworks.join(", ") || "unknown"}`);
        logger.success(`Entry points: ${result.context.scan.entryPoints.join(", ") || "none detected"}`);
        logger.success(`${result.aiUsed ? "AI enrichment used" : "Local metadata analysis used"}`);
        logger.info(`Output created: ${result.output.outputDir}`);

        for (const warning of result.output.warnings) {
          logger.warn(warning);
        }

        logger.section("Next");
        logger.muted(`Open ${result.output.outputDir}\\README.md`);
        logger.muted(`Open ${result.output.outputDir}\\SUMMARY.md`);
      } catch (error) {
        spinner.fail("SourceClass analysis failed");
        throw error;
      }
    });
}

function stringOption(value: string | boolean | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}
