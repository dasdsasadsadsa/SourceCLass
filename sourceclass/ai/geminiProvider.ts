import { AIProvider, GenerateRequest, GenerateResponse, ProviderError, requireApiKey } from "./provider.js";
import { SourceClassConfig } from "../core/types.js";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini" as const;

  constructor(
    private readonly config: SourceClassConfig,
    private readonly apiKey?: string
  ) {}

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const apiKey = requireApiKey(this.name, this.apiKey);
    const model = request.model ?? this.config.model;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const text = request.messages.map((message) => `${message.role.toUpperCase()}:\n${message.content}`).join("\n\n");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text }]
          }
        ],
        generationConfig: {
          temperature: request.temperature ?? 0.2,
          maxOutputTokens: request.maxTokens ?? 2500
        }
      })
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ProviderError(json.error?.message ?? "Gemini request failed.", this.name, response.status);
    }

    return {
      text: json.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("\n") ?? "",
      model,
      provider: this.name,
      raw: json
    };
  }
}
