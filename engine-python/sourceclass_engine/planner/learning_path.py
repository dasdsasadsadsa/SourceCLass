from __future__ import annotations

from sourceclass_engine.models import AnalysisPlan


def learning_steps(plan: AnalysisPlan) -> list[str]:
    return [
        f"Read `{path}` and write down its role, input, output, and dependency hints."
        for path in plan.learning_files[:10]
    ]
