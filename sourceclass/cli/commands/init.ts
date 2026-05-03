import { Command } from "commander";
import { initSourceClass } from "../../utils/config.js";
import { logger } from "../../utils/logger.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Create a local .sourceclass workspace")
    .action(async () => {
      await initSourceClass(process.cwd());
      logger.success("Created .sourceclass workspace");
      logger.muted("Files: .sourceclass/config.json, .sourceclass/providers.json, prompts/, cache/, reports/");
    });
}
