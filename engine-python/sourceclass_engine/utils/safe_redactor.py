from __future__ import annotations

import re


SECRET_PATTERNS = [
    re.compile(r"(?i)(api[_-]?key\s*[:=]\s*)(['\"]?)[A-Za-z0-9_\-./+=]{12,}\2"),
    re.compile(r"(?i)(token\s*[:=]\s*)(['\"]?)[A-Za-z0-9_\-./+=]{12,}\2"),
    re.compile(r"(?i)(password\s*[:=]\s*)(['\"]?)[^\s'\"]{6,}\2"),
    re.compile(r"(?i)(authorization:\s*bearer\s+)[A-Za-z0-9_\-./+=]{12,}"),
    re.compile(r"(?i)(database_url\s*[:=]\s*)(['\"]?)[^\s'\"]{8,}\2"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----.*?-----END [A-Z ]*PRIVATE KEY-----", re.DOTALL),
    re.compile(r"sk-[A-Za-z0-9]{12,}"),
]


def redact(text: str) -> str:
    redacted = text
    for pattern in SECRET_PATTERNS:
        redacted = pattern.sub(lambda match: f"{match.group(1)}[REDACTED]" if match.lastindex else "[REDACTED_SECRET]", redacted)
    return redacted
