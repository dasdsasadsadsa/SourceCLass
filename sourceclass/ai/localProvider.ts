import { AIProvider, GenerateRequest, GenerateResponse, ProviderError } from "./provider.js";
import { SourceClassConfig } from "../core/types.js";

export class LocalProvider implements AIProvider {
  readonly name = "local" as const;

  constructor(
    private readonly config: SourceClassConfig,
    private readonly apiKey?: string
  ) {}

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const model = request.model ?? this.config.model;
    const endpoint = this.config.localEndpoint ?? "http://localhost:11434/v1/chat/completions";
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 2500
      })
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ProviderError(json.error?.message ?? "Local model endpoint request failed.", this.name, response.status);
    }

    return {
      text: json.choices?.[0]?.message?.content ?? json.response ?? "",
      model,
      provider: this.name,
      raw: json
    };
  }
}
