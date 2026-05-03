from __future__ import annotations

from sourceclass_engine.models import AnalysisPlan, FileNode, ProjectMap


MODE_LIMITS = {
    "normal": 12,
    "beginner": 14,
    "pro": 28,
    "ultimate": 42,
    "master": 50,
    "enterprise": 60,
    "education": 32,
}

ROLE_WEIGHT = {
    "entry_point": 100,
    "possible_entry_point": 85,
    "dependency_manifest": 82,
    "config": 78,
    "cli": 76,
    "api": 74,
    "route": 72,
    "service": 70,
    "database": 68,
    "model": 66,
    "security_sensitive": 90,
    "build_script": 64,
    "test": 42,
    "documentation": 48,
    "unknown": 20,
}


def create_analysis_plan(project_map: ProjectMap, mode: str, languages: list[str]) -> AnalysisPlan:
    limit = MODE_LIMITS.get(mode, MODE_LIMITS["ultimate"])
    ranked = sorted(project_map.files, key=lambda file: (-score_file(file), file.path))
    important = [file.path for file in ranked[:limit]]
    deep = [file.path for file in ranked[: max(6, limit // 2)] if not file.is_binary]
    security = [
        file.path
        for file in ranked
        if "security_sensitive" in file.role_hints or "environment" in file.role_hints
    ][:40]
    learning = [
        file.path
        for file in ranked
        if any(role in file.role_hints for role in ["entry_point", "possible_entry_point", "dependency_manifest", "service", "model", "api", "documentation"])
    ][:18]
    notes = list(project_map.warnings)

    if mode == "enterprise":
        notes.append("Enterprise analysis is best-effort and not a professional security audit.")

    return AnalysisPlan(
        mode=mode,
        languages=languages,
        important_files=important,
        deep_files=deep,
        security_files=security,
        learning_files=learning,
        skipped_notes=notes,
    )


def score_file(file: FileNode) -> int:
    score = max((ROLE_WEIGHT.get(role, 20) for role in file.role_hints), default=20)
    if file.cache_hit:
        score += 2
    if file.size_bytes > 200_000:
        score -= 12
    if file.is_binary:
        score -= 50
    return score
