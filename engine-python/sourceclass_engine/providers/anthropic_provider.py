from __future__ import annotations

import os

from .base import AIProvider, post_json, require_key


class AnthropicProvider(AIProvider):
    name = "anthropic"

    def complete(self, messages: list[dict], model: str, temperature: float = 0.2) -> str:
        api_key = require_key(self.name, os.getenv("SOURCECLASS_ANTHROPIC_API_KEY"))
        system = next((message["content"] for message in messages if message.get("role") == "system"), "")
        user_messages = [
            {"role": "assistant" if message.get("role") == "assistant" else "user", "content": message.get("content", "")}
            for message in messages
            if message.get("role") != "system"
        ]
        payload = {
            "model": model,
            "system": system,
            "messages": user_messages,
            "temperature": temperature,
            "max_tokens": 3200,
        }
        data = post_json(
            "https://api.anthropic.com/v1/messages",
            {"x-api-key": api_key, "anthropic-version": "2023-06-01"},
            payload,
        )
        return "\n".join(part.get("text", "") for part in data.get("content", []))
