from __future__ import annotations

import os
import urllib.parse

from .base import AIProvider, post_json, require_key


class GeminiProvider(AIProvider):
    name = "gemini"

    def complete(self, messages: list[dict], model: str, temperature: float = 0.2) -> str:
        api_key = require_key(self.name, os.getenv("SOURCECLASS_GEMINI_API_KEY"))
        prompt = "\n\n".join(f"{message.get('role', 'user').upper()}:\n{message.get('content', '')}" for message in messages)
        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{urllib.parse.quote(model)}:generateContent?key={urllib.parse.quote(api_key)}"
        )
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": temperature, "maxOutputTokens": 3200},
        }
        data = post_json(endpoint, {}, payload)
        return "\n".join(
            part.get("text", "")
            for part in data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        )
