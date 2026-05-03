from __future__ import annotations


def bullet(items: list[str], empty: str = "None detected.") -> str:
    if not items:
        return f"- {empty}"
    return "\n".join(f"- {item}" for item in items)


def table(headers: list[str], rows: list[list[str]]) -> str:
    clean = lambda value: str(value).replace("|", "\\|").replace("\n", " ")
    lines = [
        "| " + " | ".join(clean(header) for header in headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    lines.extend("| " + " | ".join(clean(cell) for cell in row) + " |" for row in rows)
    return "\n".join(lines)


def code_block(language: str, content: str) -> str:
    safe_content = content.replace("```", "'''")
    return f"```{language}\n{safe_content}\n```"
