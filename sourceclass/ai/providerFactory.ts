import { AnthropicProvider } from "./anthropicProvider.js";
import { GeminiProvider } from "./geminiProvider.js";
import { LocalProvider } from "./localProvider.js";
import { OpenAIProvider } from "./openaiProvider.js";
import { OpenRouterProvider } from "./openrouterProvider.js";
import { AIProvider, ProviderFactoryOptions } from "./provider.js";

export function createProvider(options: ProviderFactoryOptions): AIProvider {
  switch (options.config.provider) {
    case "openai":
      return new OpenAIProvider(options.config, options.apiKey);
    case "anthropic":
      return new AnthropicProvider(options.config, options.apiKey);
    case "gemini":
      return new GeminiProvider(options.config, options.apiKey);
    case "openrouter":
      return new OpenRouterProvider(options.config, options.apiKey);
    case "local":
      return new LocalProvider(options.config, options.apiKey);
  }
}
