import { AIProvider, GenerateRequest, GenerateResponse, ProviderError, requireApiKey } from "./provider.js";
import { SourceClassConfig } from "../core/types.js";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai" as const;

  constructor(
    private readonly config: SourceClassConfig,
    private readonly apiKey?: string
  ) {}

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const apiKey = requireApiKey(this.name, this.apiKey);
    const model = request.model ?? this.config.model;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 2500
      })
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ProviderError(json.error?.message ?? "OpenAI request failed.", this.name, response.status);
    }

    return {
      text: json.choices?.[0]?.message?.content ?? "",
      model,
      provider: this.name,
      raw: json
    };
  }
}
