#!/usr/bin/env node
import { Command } from "commander";
import { registerAnalyzeCommand } from "./commands/analyze.js";
import { registerCompareCommand } from "./commands/compare.js";
import { registerConfigCommand } from "./commands/config.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerExplainCommand } from "./commands/explain.js";
import { registerInitCommand } from "./commands/init.js";
import { registerLearnCommand } from "./commands/learn.js";
import { registerMapCommand } from "./commands/map.js";
import { registerSecurityCommand } from "./commands/security.js";
import { registerTranslateCommand } from "./commands/translate.js";
import { registerVersionCommand } from "./commands/version.js";
import { VERSION } from "../version.js";
import { logger } from "../utils/logger.js";
import { toErrorMessage } from "../utils/errors.js";

const program = new Command();

program
  .name("sourceclass")
  .description("Terminal-native AI code anatomy classroom that generates GitBook-style Markdown documentation")
  .version(VERSION, "-v, --version", "Print SourceClass version")
  .showHelpAfterError()
  .configureOutput({
    outputError: (message) => logger.error(message.trim())
  });

registerInitCommand(program);
registerConfigCommand(program);
registerAnalyzeCommand(program);
registerExplainCommand(program);
registerMapCommand(program);
registerTranslateCommand(program);
registerCompareCommand(program);
registerSecurityCommand(program);
registerLearnCommand(program);
registerDoctorCommand(program);
registerVersionCommand(program);

program.parseAsync(process.argv).catch((error: unknown) => {
  logger.error(toErrorMessage(error));
  process.exitCode = 1;
});
