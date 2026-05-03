import fs from "fs-extra";
import path from "node:path";
import {
  providerNames,
  SourceClassConfig,
  sourceClassConfigSchema,
  ProviderName
} from "../core/types.js";
import { writeJson } from "./fs.js";

export const SOURCECLASS_DIR = ".sourceclass";
export const CONFIG_FILE = "config.json";
export const PROVIDERS_FILE = "providers.json";

export const DEFAULT_CONFIG: SourceClassConfig = sourceClassConfigSchema.parse({});

export const providerEnvVars: Record<ProviderName, string> = {
  openai: "SOURCECLASS_OPENAI_API_KEY",
  anthropic: "SOURCECLASS_ANTHROPIC_API_KEY",
  gemini: "SOURCECLASS_GEMINI_API_KEY",
  openrouter: "SOURCECLASS_OPENROUTER_API_KEY",
  local: "SOURCECLASS_LOCAL_API_KEY"
};

export interface ProviderSecretFile {
  apiKeys?: Partial<Record<ProviderName, string>>;
}

export function getConfigPath(cwd = process.cwd()): string {
  return path.join(cwd, SOURCECLASS_DIR, CONFIG_FILE);
}

export function getProvidersPath(cwd = process.cwd()): string {
  return path.join(cwd, SOURCECLASS_DIR, PROVIDERS_FILE);
}

export async function initSourceClass(cwd = process.cwd()): Promise<void> {
  const sourceClassDir = path.join(cwd, SOURCECLASS_DIR);
  await fs.ensureDir(path.join(sourceClassDir, "prompts"));
  await fs.ensureDir(path.join(sourceClassDir, "cache"));
  await fs.ensureDir(path.join(sourceClassDir, "reports"));

  const configPath = getConfigPath(cwd);
  if (!(await fs.pathExists(configPath))) {
    await writeJson(configPath, DEFAULT_CONFIG);
  }

  const providersPath = getProvidersPath(cwd);
  if (!(await fs.pathExists(providersPath))) {
    await writeJson(providersPath, {
      apiKeys: {},
      note: "Prefer environment variables for API keys. This file is gitignored by default."
    });
  }
}

export async function loadConfig(cwd = process.cwd()): Promise<SourceClassConfig> {
  const configPath = getConfigPath(cwd);

  if (!(await fs.pathExists(configPath))) {
    return DEFAULT_CONFIG;
  }

  const raw = await fs.readJson(configPath);
  return sourceClassConfigSchema.parse({
    ...DEFAULT_CONFIG,
    ...raw
  });
}

export async function saveConfig(config: SourceClassConfig, cwd = process.cwd()): Promise<void> {
  await writeJson(getConfigPath(cwd), sourceClassConfigSchema.parse(config));
}

export async function loadProviderSecrets(cwd = process.cwd()): Promise<ProviderSecretFile> {
  const providersPath = getProvidersPath(cwd);

  if (!(await fs.pathExists(providersPath))) {
    return {};
  }

  return fs.readJson(providersPath) as Promise<ProviderSecretFile>;
}

export async function saveProviderSecrets(secrets: ProviderSecretFile, cwd = process.cwd()): Promise<void> {
  await writeJson(getProvidersPath(cwd), secrets);
}

export async function resolveApiKey(
  provider: ProviderName,
  config: SourceClassConfig,
  cwd = process.cwd()
): Promise<string | undefined> {
  const envValue = process.env[providerEnvVars[provider]];
  if (envValue) {
    return envValue;
  }

  if (config.apiKeys?.[provider]) {
    return config.apiKeys[provider];
  }

  const secretFile = await loadProviderSecrets(cwd);
  return secretFile.apiKeys?.[provider];
}

export function assertProviderName(value: string): ProviderName {
  if ((providerNames as readonly string[]).includes(value)) {
    return value as ProviderName;
  }

  throw new Error(`Unsupported provider: ${value}`);
}
