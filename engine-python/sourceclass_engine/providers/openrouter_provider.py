from __future__ import annotations

import os

from .base import AIProvider, post_json, require_key


class OpenRouterProvider(AIProvider):
    name = "openrouter"

    def complete(self, messages: list[dict], model: str, temperature: float = 0.2) -> str:
        api_key = require_key(self.name, os.getenv("SOURCECLASS_OPENROUTER_API_KEY"))
        payload = {"model": model, "messages": messages, "temperature": temperature}
        data = post_json(
            "https://openrouter.ai/api/v1/chat/completions",
            {"Authorization": f"Bearer {api_key}", "X-Title": "SourceClass Python Engine"},
            payload,
        )
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")
