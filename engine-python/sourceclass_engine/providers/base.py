from __future__ import annotations

import json
import urllib.error
import urllib.request
from abc import ABC, abstractmethod
from typing import Any

from sourceclass_engine.utils.errors import ProviderError


class AIProvider(ABC):
    name: str

    @abstractmethod
    def complete(self, messages: list[dict], model: str, temperature: float = 0.2) -> str:
        raise NotImplementedError


def require_key(provider: str, value: str | None) -> str:
    if not value:
        raise ProviderError(f"SourceClass Python engine could not find an API key for {provider}.")
    return value


def post_json(url: str, headers: dict[str, str], payload: dict[str, Any]) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={**headers, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise ProviderError(f"Provider returned HTTP {error.code}: {body[:500]}") from error
    except urllib.error.URLError as error:
        raise ProviderError(f"Provider request failed: {error}") from error
