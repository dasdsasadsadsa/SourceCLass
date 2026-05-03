from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from sourceclass_engine.models import ProjectMap
from sourceclass_engine.planner.analysis_planner import create_analysis_plan
from sourceclass_engine.prompts.base import BASE_PROMPT
from sourceclass_engine.prompts.beginner import BEGINNER_PROMPT
from sourceclass_engine.prompts.education import EDUCATION_PROMPT
from sourceclass_engine.prompts.enterprise import ENTERPRISE_PROMPT
from sourceclass_engine.prompts.master import MASTER_PROMPT
from sourceclass_engine.prompts.pro import PRO_PROMPT
from sourceclass_engine.prompts.ultimate import ULTIMATE_PROMPT
from sourceclass_engine.providers import (
    AnthropicProvider,
    GeminiProvider,
    LocalProvider,
    OpenAIProvider,
    OpenRouterProvider,
    ProviderError,
)
from sourceclass_engine.utils.json_io import load_json
from sourceclass_engine.utils.safe_redactor import redact
from sourceclass_engine.writers.gitbook_writer import write_gitbook


PROVIDERS = {
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "gemini": GeminiProvider,
    "openrouter": OpenRouterProvider,
    "local": LocalProvider,
}

MODE_PROMPTS = {
    "normal": BEGINNER_PROMPT,
    "beginner": BEGINNER_PROMPT,
    "pro": PRO_PROMPT,
    "ultimate": ULTIMATE_PROMPT,
    "master": MASTER_PROMPT,
    "enterprise": ENTERPRISE_PROMPT,
    "education": EDUCATION_PROMPT,
}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="SourceClass Python AI analysis engine")
    parser.add_argument("--project-map", required=True, help="Rust-generated project_map.json")
    parser.add_argument("--mode", default="ultimate", choices=list(MODE_PROMPTS.keys()))
    parser.add_argument("--lang", default="ko,en,ja", help="Comma-separated languages: ko,en,ja")
    parser.add_argument("--out", default="sourceclass-output", help="Output directory")
    parser.add_argument("--provider", default=os.getenv("SOURCECLASS_PROVIDER", "openai"))
    parser.add_argument("--model", default=os.getenv("SOURCECLASS_MODEL", "gpt-4.1"))
    parser.add_argument("--mock", action="store_true", help="Generate realistic docs without AI provider calls")
    args = parser.parse_args(argv)

    raw_map = load_json(args.project_map)
    project_map = ProjectMap.from_dict(raw_map)
    languages = parse_languages(args.lang)
    plan = create_analysis_plan(project_map, args.mode, languages)

    if args.mock:
        plan.ai_summary = mock_summary(project_map, plan)
        print("sourceclass-engine: mock mode enabled; no AI provider was called")
    else:
        try:
            provider_class = PROVIDERS.get(args.provider)
            if provider_class is None:
                raise ProviderError(f"Unsupported provider: {args.provider}")
            provider = provider_class()
            plan.ai_summary = provider.complete(build_messages(project_map, plan), args.model)
            print(f"sourceclass-engine: AI enrichment completed with provider={args.provider}")
        except ProviderError as error:
            raise SystemExit(f"sourceclass-engine provider error: {error}") from error

    write_gitbook(project_map, plan, args.out, raw_map)
    print(f"sourceclass-engine: wrote GitBook output -> {Path(args.out).resolve()}")
    return 0


def parse_languages(value: str) -> list[str]:
    if value == "all":
        return ["ko", "en", "ja"]
    languages = [item.strip() for item in value.split(",") if item.strip()]
    allowed = {"ko", "en", "ja"}
    invalid = [item for item in languages if item not in allowed]
    if invalid:
        raise SystemExit(f"Unsupported language(s): {', '.join(invalid)}")
    return languages or ["ko", "en", "ja"]


def build_messages(project_map: ProjectMap, plan) -> list[dict]:
    compact = {
        "projectRoot": project_map.project_root,
        "stats": project_map.stats,
        "detectedStack": project_map.detected_stack,
        "importantFiles": plan.important_files[:30],
        "securityFiles": plan.security_files[:20],
        "folders": [{"path": folder.path, "roleHints": folder.role_hints} for folder in project_map.folders[:60]],
    }
    return [
        {"role": "system", "content": f"{BASE_PROMPT}\n\n{MODE_PROMPTS[plan.mode]}"},
        {
            "role": "user",
            "content": (
                "Analyze this Rust-generated SourceClass project map. "
                "Return concise GitBook-style teacher notes.\n\n"
                + redact(json.dumps(compact, ensure_ascii=False, indent=2))
            ),
        },
    ]


def mock_summary(project_map: ProjectMap, plan) -> str:
    languages = ", ".join(project_map.detected_stack.get("languages", [])) or "unknown languages"
    return (
        f"Mock analysis: this project contains {project_map.stats.get('includedFiles', 0)} included files "
        f"using {languages}. SourceClass selected {len(plan.important_files)} important files, "
        f"{len(plan.security_files)} security-sensitive files, and {len(plan.learning_files)} learning-path files. "
        "This placeholder is deterministic and safe for CI because no AI provider is called."
    )
