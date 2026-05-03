import fs from "fs-extra";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Command } from "commander";
import { scanProject } from "../../core/projectScanner.js";
import { loadConfig, providerEnvVars, resolveApiKey } from "../../utils/config.js";
import { getGitVersion } from "../../utils/git.js";
import { logger, maskSecret } from "../../utils/logger.js";

const execFileAsync = promisify(execFile);

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Check SourceClass configuration, provider keys, local tools, and project scan readiness")
    .action(async () => {
      logger.section("SourceClass Doctor");
      logger.success(`Node.js ${process.version}`);

      const python = await getPythonVersion();
      if (python) logger.success(python);
      else logger.warn("Python was not found on PATH. Python is optional for SourceClass.");

      const git = await getGitVersion();
      if (git) logger.success(git);
      else logger.warn("Git was not found on PATH. Git is optional but useful for source projects.");

      const config = await loadConfig(process.cwd());
      logger.success(`Config loaded: provider=${config.provider}, model=${config.model}, mode=${config.mode}`);

      const apiKey = await resolveApiKey(config.provider, config, process.cwd());
      if (apiKey) {
        logger.success(`API key found for ${config.provider}: ${maskSecret(apiKey)}`);
      } else if (config.provider === "local") {
        logger.warn("No local API key found. This is fine if your local endpoint does not require one.");
      } else {
        logger.warn(`No API key found. Set ${providerEnvVars[config.provider]} or run sourceclass config.`);
      }

      try {
        await fs.access(process.cwd(), fs.constants.W_OK);
        logger.success("Current directory is writable");
      } catch {
        logger.warn("Current directory may not be writable");
      }

      try {
        const scan = await scanProject(process.cwd(), config);
        logger.success(`Project scan ready: ${scan.stats.readableFiles} readable files, ${scan.stats.ignoredFiles} skipped paths`);
        logger.muted(`Estimated stack: ${scan.frameworks.join(", ") || "unknown"}`);
      } catch (error) {
        logger.warn(`Project scan failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
}

async function getPythonVersion(): Promise<string | undefined> {
  for (const command of ["python", "python3", "py"]) {
    try {
      const { stdout, stderr } = await execFileAsync(command, ["--version"]);
      return (stdout || stderr).trim();
    } catch {
      // Try next command.
    }
  }

  return undefined;
}
