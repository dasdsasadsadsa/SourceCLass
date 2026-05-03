import { Command } from "commander";
import { analyzeAndWrite } from "../../core/analysisEngine.js";
import { loadConfig } from "../../utils/config.js";
import { logger } from "../../utils/logger.js";
import { mergeCliConfig, startTask } from "../commandUtils.js";

export function registerMapCommand(program: Command): void {
  program
    .command("map")
    .argument("<path>", "Project path")
    .description("Generate a folder and dependency map")
    .option("--output <dir>", "Output directory")
    .action(async (target: string, options: { output?: string }) => {
      const baseConfig = await loadConfig(process.cwd());
      const config = mergeCliConfig(baseConfig, { output: options.output, mode: "normal" });
      const spinner = startTask("Generating project map");
      const result = await analyzeAndWrite(target, config, { ai: false, cwd: process.cwd() });
      spinner.succeed("Generated project map");
      logger.info(`Map: ${result.output.outputDir}\\02-project-map.md`);
      logger.info(`Dependency data: ${result.output.outputDir}\\data\\dependency_map.json`);
    });
}
