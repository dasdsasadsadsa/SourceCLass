from __future__ import annotations

from sourceclass_engine.models import AnalysisPlan, ProjectMap


def korean(project_map: ProjectMap, plan: AnalysisPlan) -> str:
    return f"""# 한국어 설명

SourceClass Python 엔진이 Rust 프로젝트 맵을 기반으로 이 코드베이스를 수업처럼 읽을 수 있게 정리했습니다.

## 핵심 요약

- 분석 루트: `{project_map.project_root}`
- 주요 언어: `{", ".join(project_map.detected_stack.get("languages", [])) or "알 수 없음"}`
- 추천 모드: `{plan.mode}`

## 먼저 읽을 파일

{numbered(plan.learning_files[:8])}

## 초보자 주의점

- 인증, 토큰, 권한, 배포 관련 파일은 충분히 이해한 뒤 수정하세요.
- 민감한 프로젝트는 로컬 모델을 사용하세요.
- 이 문서는 학습 지도이며, 소스 코드 읽기를 대신하지 않습니다.
"""


def english(project_map: ProjectMap, plan: AnalysisPlan) -> str:
    return f"""# English Explanation

SourceClass Python engine turned the Rust project map into a GitBook-style code classroom.

## Snapshot

- Root: `{project_map.project_root}`
- Languages: `{", ".join(project_map.detected_stack.get("languages", [])) or "Unknown"}`
- Mode: `{plan.mode}`

## Recommended First Files

{numbered(plan.learning_files[:8])}

## Notes

- Use a trusted AI provider or a local model for private code.
- Treat security-sensitive, environment, database, and build files carefully.
- This documentation is a learning map, not a substitute for reading the source.
"""


def japanese(project_map: ProjectMap, plan: AnalysisPlan) -> str:
    return f"""# 日本語説明

SourceClass Python エンジンは、Rust が生成したプロジェクトマップをもとに、このコードベースを GitBook 風の学習ドキュメントとして整理しました。

## 概要

- ルート: `{project_map.project_root}`
- 主な言語: `{", ".join(project_map.detected_stack.get("languages", [])) or "不明"}`
- モード: `{plan.mode}`

## 最初に読むファイル

{numbered(plan.learning_files[:8])}

## 注意点

- 認証、トークン、権限、デプロイ関連のファイルは慎重に扱ってください。
- 非公開コードではローカルモデルの利用を検討してください。
- この文書は学習用の地図であり、ソースコードの確認を置き換えるものではありません。
"""


def numbered(items: list[str]) -> str:
    if not items:
        return "1. README and dependency manifests"
    return "\n".join(f"{index}. `{item}`" for index, item in enumerate(items, start=1))
