import { AIProvider, GenerateRequest, GenerateResponse, ProviderError, requireApiKey } from "./provider.js";
import { SourceClassConfig } from "../core/types.js";

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic" as const;

  constructor(
    private readonly config: SourceClassConfig,
    private readonly apiKey?: string
  ) {}

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const apiKey = requireApiKey(this.name, this.apiKey);
    const model = request.model ?? this.config.model;
    const system = request.messages.find((message) => message.role === "system")?.content;
    const messages = request.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content
      }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        system,
        messages,
        max_tokens: request.maxTokens ?? 2500,
        temperature: request.temperature ?? 0.2
      })
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ProviderError(json.error?.message ?? "Anthropic request failed.", this.name, response.status);
    }

    return {
      text: json.content?.map((part: { text?: string }) => part.text ?? "").join("\n") ?? "",
      model,
      provider: this.name,
      raw: json
    };
  }
}
