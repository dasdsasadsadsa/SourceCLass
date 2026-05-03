import { ProviderName, SourceClassConfig } from "../core/types.js";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateResponse {
  text: string;
  model: string;
  provider: ProviderName;
  raw?: unknown;
}

export interface AIProvider {
  name: ProviderName;
  generate(request: GenerateRequest): Promise<GenerateResponse>;
}

export interface ProviderFactoryOptions {
  config: SourceClassConfig;
  apiKey?: string;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: ProviderName,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export function requireApiKey(provider: ProviderName, apiKey?: string): string {
  if (!apiKey) {
    throw new ProviderError(`Missing API key for provider '${provider}'.`, provider);
  }

  return apiKey;
}
