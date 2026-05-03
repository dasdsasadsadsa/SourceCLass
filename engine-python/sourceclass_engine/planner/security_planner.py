from __future__ import annotations

from sourceclass_engine.models import FileNode, ProjectMap


def security_risks(project_map: ProjectMap) -> list[dict[str, str]]:
    risks: list[dict[str, str]] = []
    for file in project_map.files:
        if should_review(file):
            risks.append(
                {
                    "file": file.path,
                    "risk": ", ".join(file.role_hints),
                    "mitigation": "Review manually before changes; avoid sending secrets to external providers.",
                }
            )
    return risks[:40]


def should_review(file: FileNode) -> bool:
    return any(role in file.role_hints for role in ["security_sensitive", "environment", "database", "build_script"])
