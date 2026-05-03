import { LanguageCode, languageCodes, ProviderName, providerNames, SourceClassConfig, sourceClassModes, SourceClassMode } from "../core/types.js";
import { logger } from "../utils/logger.js";
import ora from "ora";

export interface TaskSpinner {
  text: string;
  succeed(message?: string): void;
  fail(message?: string): void;
  warn(message?: string): void;
}

export function startTask(text: string): TaskSpinner {
  if (process.stderr.isTTY) {
    return ora(text).start();
  }

  logger.muted(text);
  return {
    text,
    succeed(message = text): void {
      logger.success(message);
    },
    fail(message = text): void {
      logger.error(message);
    },
    warn(message = text): void {
      logger.warn(message);
    }
  };
}

export function parseLanguages(value: string | undefined, fallback: LanguageCode[]): LanguageCode[] {
  if (!value) {
    return fallback;
  }

  if (value === "all") {
    return ["ko", "en", "ja"];
  }

  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const language of parsed) {
    if (!(languageCodes as readonly string[]).includes(language)) {
      throw new Error(`Unsupported language '${language}'. Use ko, en, ja, or all.`);
    }
  }

  return parsed as LanguageCode[];
}

export function parseMode(value: string | undefined, fallback: SourceClassMode): SourceClassMode {
  if (!value) {
    return fallback;
  }

  if (!(sourceClassModes as readonly string[]).includes(value)) {
    throw new Error(`Unsupported mode '${value}'. Use ${sourceClassModes.join(", ")}.`);
  }

  return value as SourceClassMode;
}

export function parseProvider(value: string | undefined, fallback: ProviderName): ProviderName {
  if (!value) {
    return fallback;
  }

  if (!(providerNames as readonly string[]).includes(value)) {
    throw new Error(`Unsupported provider '${value}'. Use ${providerNames.join(", ")}.`);
  }

  return value as ProviderName;
}

export function mergeCliConfig(
  base: SourceClassConfig,
  options: {
    mode?: string;
    lang?: string;
    output?: string;
    provider?: string;
    model?: string;
    maxFiles?: string;
  }
): SourceClassConfig {
  return {
    ...base,
    mode: parseMode(options.mode, base.mode),
    language: parseLanguages(options.lang, base.language),
    outputDir: options.output ?? base.outputDir,
    provider: parseProvider(options.provider, base.provider),
    model: options.model ?? base.model,
    maxFiles: options.maxFiles ? Number(options.maxFiles) : base.maxFiles
  };
}

export function formatPathList(paths: string[], max = 10): string {
  if (paths.length === 0) {
    return "None detected";
  }

  const listed = paths.slice(0, max).map((item) => `- ${item}`);
  if (paths.length > max) {
    listed.push(`- ...and ${paths.length - max} more`);
  }

  return listed.join("\n");
}
