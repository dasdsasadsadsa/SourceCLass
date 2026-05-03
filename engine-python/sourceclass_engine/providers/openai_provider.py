from __future__ import annotations

import os

from .base import AIProvider, post_json, require_key


class OpenAIProvider(AIProvider):
    name = "openai"

    def complete(self, messages: list[dict], model: str, temperature: float = 0.2) -> str:
        api_key = require_key(self.name, os.getenv("SOURCECLASS_OPENAI_API_KEY"))
        payload = {"model": model, "messages": messages, "temperature": temperature}
        data = post_json("https://api.openai.com/v1/chat/completions", {"Authorization": f"Bearer {api_key}"}, payload)
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")
