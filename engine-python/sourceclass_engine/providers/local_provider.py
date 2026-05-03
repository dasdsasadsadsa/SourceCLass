from __future__ import annotations

import os

from .base import AIProvider, post_json


class LocalProvider(AIProvider):
    name = "local"

    def complete(self, messages: list[dict], model: str, temperature: float = 0.2) -> str:
        endpoint = os.getenv("SOURCECLASS_LOCAL_ENDPOINT", "http://localhost:11434/v1/chat/completions")
        payload = {"model": model, "messages": messages, "temperature": temperature}
        headers = {}
        if os.getenv("SOURCECLASS_LOCAL_API_KEY"):
            headers["Authorization"] = f"Bearer {os.getenv('SOURCECLASS_LOCAL_API_KEY')}"
        data = post_json(endpoint, headers, payload)
        return data.get("choices", [{}])[0].get("message", {}).get("content", data.get("response", ""))
