import { checkbox, confirm, input, password, select } from "@inquirer/prompts";
import { Command } from "commander";
import { languageCodes, providerNames, sourceClassModes, SourceClassConfig } from "../../core/types.js";
import {
  initSourceClass,
  loadConfig,
  providerEnvVars,
  saveConfig,
  saveProviderSecrets
} from "../../utils/config.js";
import { logger, maskSecret } from "../../utils/logger.js";

export function registerConfigCommand(program: Command): void {
  program
    .command("config")
    .description("Interactive provider, API key, language, and mode setup")
    .action(async () => {
      await initSourceClass(process.cwd());
      const current = await loadConfig(process.cwd());

      const provider = await select({
        message: "Which AI provider do you want to use?",
        default: current.provider,
        choices: providerNames.map((name) => ({ name, value: name }))
      });

      const model = await input({
        message: "Model name",
        default: current.model
      });

      const language = await checkbox({
        message: "Default documentation language",
        choices: languageCodes.map((code) => ({
          name: code,
          value: code,
          checked: current.language.includes(code)
        }))
      });

      const mode = await select({
        message: "Default analysis mode",
        default: current.mode,
        choices: sourceClassModes.map((item) => ({ name: item, value: item }))
      });

      const outputDir = await input({
        message: "Output directory",
        default: current.outputDir
      });

      let localEndpoint = current.localEndpoint;
      if (provider === "local") {
        localEndpoint = await input({
          message: "Local OpenAI-compatible endpoint",
          default: current.localEndpoint ?? "http://localhost:11434/v1/chat/completions"
        });
      }

      const apiKey = await password({
        message: `API key for ${provider} (leave empty to use ${providerEnvVars[provider]})`,
        mask: "*"
      });

      const nextConfig: SourceClassConfig = {
        ...current,
        provider,
        model,
        language: language.length > 0 ? language : current.language,
        mode,
        outputDir,
        localEndpoint
      };

      await saveConfig(nextConfig, process.cwd());

      if (apiKey) {
        logger.warn("Storing API keys locally is less safe than environment variables.");
        const storeLocal = await confirm({
          message: "Store this API key in .sourceclass/providers.json?",
          default: false
        });

        if (storeLocal) {
          await saveProviderSecrets({ apiKeys: { [provider]: apiKey } }, process.cwd());
          logger.success(`Stored local provider key as ${maskSecret(apiKey)} in .sourceclass/providers.json`);
        } else {
          logger.info(`Set this environment variable instead: ${providerEnvVars[provider]}`);
        }
      }

      logger.success("Saved .sourceclass/config.json");
      logger.muted("SourceClass never prints full API keys and does not use a SourceClass server.");
    });
}
