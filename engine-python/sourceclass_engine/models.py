from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


SCHEMA_VERSION = "sourceclass.projectMap.v1"


@dataclass(slots=True)
class ChunkPlan:
    chunk_id: str
    start_line: int
    end_line: int
    estimated_tokens: int
    reason: str
    includes_header_context: bool

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> "ChunkPlan":
        return cls(
            chunk_id=str(value.get("chunkId", "")),
            start_line=int(value.get("startLine", 1)),
            end_line=int(value.get("endLine", 1)),
            estimated_tokens=int(value.get("estimatedTokens", 0)),
            reason=str(value.get("reason", "unknown")),
            includes_header_context=bool(value.get("includesHeaderContext", False)),
        )


@dataclass(slots=True)
class FileNode:
    path: str
    absolute_path: str
    size_bytes: int
    language: str
    extension: str
    hash: str
    is_binary: bool
    is_ignored: bool
    cache_hit: bool
    role_hints: list[str] = field(default_factory=list)
    dependency_hints: list[str] = field(default_factory=list)
    chunk_plan: list[ChunkPlan] = field(default_factory=list)

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> "FileNode":
        return cls(
            path=str(value.get("path", "")),
            absolute_path=str(value.get("absolutePath", "")),
            size_bytes=int(value.get("sizeBytes", 0)),
            language=str(value.get("language", "Unknown")),
            extension=str(value.get("extension", "")),
            hash=str(value.get("hash", "")),
            is_binary=bool(value.get("isBinary", False)),
            is_ignored=bool(value.get("isIgnored", False)),
            cache_hit=bool(value.get("cacheHit", False)),
            role_hints=list(value.get("roleHints", [])),
            dependency_hints=list(value.get("dependencyHints", [])),
            chunk_plan=[ChunkPlan.from_dict(item) for item in value.get("chunkPlan", [])],
        )


@dataclass(slots=True)
class FolderNode:
    path: str
    file_count: int
    role_hints: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> "FolderNode":
        return cls(
            path=str(value.get("path", "")),
            file_count=int(value.get("fileCount", 0)),
            role_hints=list(value.get("roleHints", [])),
        )


@dataclass(slots=True)
class ProjectMap:
    schema_version: str
    project_root: str
    generated_at: str
    stats: dict[str, Any]
    detected_stack: dict[str, Any]
    files: list[FileNode]
    folders: list[FolderNode]
    warnings: list[str]

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> "ProjectMap":
        schema = value.get("schemaVersion")
        if schema != SCHEMA_VERSION:
            raise ValueError(f"Unsupported project map schema: {schema!r}")

        return cls(
            schema_version=str(schema),
            project_root=str(value.get("projectRoot", "")),
            generated_at=str(value.get("generatedAt", "")),
            stats=dict(value.get("stats", {})),
            detected_stack=dict(value.get("detectedStack", {})),
            files=[FileNode.from_dict(item) for item in value.get("files", [])],
            folders=[FolderNode.from_dict(item) for item in value.get("folders", [])],
            warnings=list(value.get("warnings", [])),
        )


@dataclass(slots=True)
class AnalysisPlan:
    mode: str
    languages: list[str]
    important_files: list[str]
    deep_files: list[str]
    security_files: list[str]
    learning_files: list[str]
    skipped_notes: list[str]
    ai_summary: str | None = None

    def to_json(self) -> dict[str, Any]:
        return {
            "mode": self.mode,
            "languages": self.languages,
            "importantFiles": self.important_files,
            "deepFiles": self.deep_files,
            "securityFiles": self.security_files,
            "learningFiles": self.learning_files,
            "skippedNotes": self.skipped_notes,
            "aiSummary": self.ai_summary,
        }
