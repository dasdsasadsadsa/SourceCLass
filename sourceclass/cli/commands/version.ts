import { Command } from "commander";
import { VERSION } from "../../version.js";

export function registerVersionCommand(program: Command): void {
  program
    .command("version")
    .description("Print SourceClass version")
    .action(() => {
      console.log(`SourceClass v${VERSION}`);
    });
}
