import path from "node:path";
import { ReportContext } from "./types.js";
import { gitbookSummaryTemplate } from "../docs/templates/gitbookSummary.js";
import { outputReadmeTemplate } from "../docs/templates/readmeTemplate.js";
import { overviewTemplate } from "../docs/templates/overviewTemplate.js";
import { folderMapTemplate } from "../docs/templates/folderMapTemplate.js";
import { executionFlowTemplate } from "../docs/templates/executionFlowTemplate.js";
import { fileRoleTemplate } from "../docs/templates/fileRoleTemplate.js";
import { learningPathTemplate } from "../docs/templates/learningPathTemplate.js";
import { securityTemplate } from "../docs/templates/securityTemplate.js";
import { businessTemplate } from "../docs/templates/businessTemplate.js";
import { mindMapTemplate } from "../docs/templates/mindMapTemplate.js";
import { monthlyLearningTemplate } from "../docs/templates/monthlyLearningTemplate.js";
import { list, section, table } from "../utils/markdown.js";

export function generateReports(context: ReportContext): Record<string, string> {
  return {
    "README.md": outputReadmeTemplate(context),
    "SUMMARY.md": gitbookSummaryTemplate(true),
    "01-introduction.md": overviewTemplate(context),
    "02-project-map.md": folderMapTemplate(context),
    "03-folder-anatomy.md": folderAnatomy(context),
    "04-execution-flow.md": executionFlowTemplate(context),
    "05-file-roles.md": fileRoleTemplate(context),
    "06-beginner-explanation.md": beginnerExplanation(context),
    "07-modification-guide.md": modificationGuide(context),
    "08-learning-path.md": learningPathTemplate(context),
    "09-build-and-run.md": buildAndRun(context),
    "10-open-source-comparison.md": openSourceComparison(context),
    "11-security-notes.md": securityTemplate(context),
    "12-business-direction.md": businessTemplate(context),
    "13-mind-map-navigation.md": mindMapTemplate(context),
    "14-30-day-code-class.md": monthlyLearningTemplate(context),
    "languages/ko.md": koreanDoc(context),
    "languages/en.md": englishDoc(context),
    "languages/ja.md": japaneseDoc(context)
  };
}

function folderAnatomy(context: ReportContext): string {
  const folderRows = new Map<string, { roles: Set<string>; files: string[] }>();
  for (const role of context.roles) {
    const folder = path.dirname(role.path).replace(/\\/g, "/");
    const key = folder === "." ? "/" : folder;
    const item = folderRows.get(key) ?? { roles: new Set<string>(), files: [] };
    item.roles.add(role.role);
    item.files.push(role.path);
    folderRows.set(key, item);
  }

  const rows = [...folderRows.entries()].map(([folder, item]) => [
    folder,
    [...item.roles].join(", "),
    item.files.slice(0, 8).map((file) => `\`${file}\``).join(", ")
  ]);

  return `# Folder Anatomy

Each folder is explained as a responsibility area. This is a map for learners before deep reading.

${table(["Folder", "Responsibilities", "Representative Files"], rows)}

## How To Use This Page

Use this page before editing. If a folder contains entry points, APIs, database code, or security-sensitive files, treat it as a higher-risk area.
`;
}

function beginnerExplanation(context: ReportContext): string {
  return `# Beginner Explanation

## Simple Mental Model

Think of this project as a set of rooms:

- Entry point files start the program.
- Config files tell tools how to build, run, and package it.
- API files receive outside requests or commands.
- Model and database files describe data.
- Utility files hold reusable helper logic.
- Test files explain expected behavior.

## What To Read First

${context.plan.learningPathFiles.slice(0, 8).map((file, index) => `${index + 1}. \`${file}\``).join("\n") || "Start with the README and configuration files."}

## Beginner Warnings

- Do not edit authentication, token, or permission code until you understand it.
- Do not delete config files just because they look small.
- Do not paste private code into an AI provider you do not trust.
- Run tests or builds after each small change when scripts are available.
`;
}

function modificationGuide(context: ReportContext): string {
  const safeFiles = context.roles
    .filter((record) => ["documentation", "test", "utility", "ui"].includes(record.role))
    .slice(0, 40)
    .map((record) => `\`${record.path}\``);
  const dangerousFiles = context.roles
    .filter((record) => ["security-sensitive", "database", "entry-point", "build-script", "config"].includes(record.role))
    .slice(0, 40)
    .map((record) => `\`${record.path}\``);

  return `# Modification Guide

## Safe Modification Map

These files are usually safer first changes, depending on project context:

${list(safeFiles)}

## Dangerous Modification Map

These files may affect startup, security, persistence, packaging, or deployment:

${list(dangerousFiles)}

## If You Want To Change X

- Change text or documentation: start with documentation files.
- Change UI behavior: start with UI files, then follow imports into shared utilities.
- Change API behavior: inspect route/controller files, models, validation, and tests together.
- Change data shape: inspect models, schemas, migrations, and test fixtures together.
- Change build or packaging: inspect package scripts, Dockerfiles, and config files together.

## Refactor Suggestions

- Add tests before refactoring high-risk files.
- Keep changes small and reversible.
- Prefer improving naming and documentation before moving large modules.
- Document any new environment variables in \`.env.example\`.
`;
}

function buildAndRun(context: ReportContext): string {
  const scripts = Object.entries(context.dependencies.scripts);
  const installHint = context.scan.packageManagers.includes("pnpm")
    ? "pnpm install"
    : context.scan.packageManagers.includes("yarn")
      ? "yarn install"
      : context.scan.packageManagers.includes("npm")
        ? "npm install"
        : context.scan.packageManagers.includes("python")
          ? "python -m venv .venv && pip install -r requirements.txt"
          : "Check the project README for install instructions.";

  return `# Build and Run

SourceClass does not install dependencies or execute unknown project code automatically. Use these notes as a starting point.

## Install Dependencies

\`\`\`bash
${installHint}
\`\`\`

## Detected Scripts

${scripts.length > 0 ? table(["Script", "Command"], scripts.map(([name, command]) => [`\`${name}\``, `\`${command}\``])) : "No package scripts were detected."}

## Common Next Steps

1. Read the project README.
2. Install dependencies using the detected package manager.
3. Copy \`.env.example\` to a local env file only if the project requires it.
4. Run tests before modifying behavior.
5. Run the development or build command documented by the project.
`;
}

function openSourceComparison(context: ReportContext): string {
  const keywords = [
    ...context.scan.frameworks,
    ...Object.keys(context.scan.languages),
    "cli",
    "code-analysis",
    "documentation"
  ]
    .filter(Boolean)
    .slice(0, 10);

  return `# Open Source Comparison

SourceClass does not aggressively crawl repositories. Use safe public metadata, the GitHub API with your token, or manual search.

## Suggested Search Queries

- \`topic:cli topic:documentation ${keywords.join(" ")} license:mit\`
- \`"${keywords[0] ?? "code analysis"}" "MIT" "GitHub"\`
- \`topic:code-analysis topic:ai documentation cli\`

## What To Compare

- License compatibility
- Folder structure
- CLI command design
- Configuration style
- Test coverage
- Security posture
- Documentation clarity

## License Caution

Do not copy code from another repository unless the license allows it and attribution requirements are satisfied.
`;
}

function koreanDoc(context: ReportContext): string {
  return `# 한국어 설명

SourceClass는 이 프로젝트를 "수업처럼 읽을 수 있는 코드 해부 문서"로 정리했습니다.

## 한 줄 설명

이 프로젝트는 ${Object.keys(context.scan.languages).join(", ") || "여러 언어"} 파일로 구성되어 있으며, 주요 진입점과 설정 파일을 먼저 읽는 것이 좋습니다.

## 먼저 볼 것

${context.plan.learningPathFiles.slice(0, 8).map((file, index) => `${index + 1}. \`${file}\``).join("\n") || "README와 설정 파일부터 읽어 보세요."}

## 초보자 주의점

- 인증, 토큰, 권한 관련 파일은 충분히 이해한 뒤 수정하세요.
- \`.env\` 같은 비밀 파일은 AI 제공자에게 보내지 않는 것이 안전합니다.
- 작은 변경을 한 뒤 테스트나 빌드를 실행해 확인하세요.
- 모르는 코드는 먼저 역할, 입력, 출력, 연결 관계를 적어 보세요.
`;
}

function englishDoc(context: ReportContext): string {
  return `# English Explanation

SourceClass organized this repository as a GitBook-style code anatomy classroom.

## Project Summary

The project contains ${context.scan.stats.readableFiles} readable files. Start with entry points, configuration files, and the generated project map before changing behavior.

## Recommended First Files

${context.plan.learningPathFiles.slice(0, 8).map((file, index) => `${index + 1}. \`${file}\``).join("\n") || "Start with README and configuration files."}

## Beginner Notes

- Treat auth, token, permission, and deployment files as high-risk.
- Use a trusted AI provider or local model for private code.
- Run tests or builds after small changes.
- Use this document as a learning map, not as a substitute for reading the source.
`;
}

function japaneseDoc(context: ReportContext): string {
  return `# 日本語説明

SourceClass は、このリポジトリを GitBook 風の「コード解剖クラス」として整理しました。

## 概要

このプロジェクトには ${context.scan.stats.readableFiles} 個の読み取り可能なファイルがあります。まずエントリーポイント、設定ファイル、プロジェクトマップを確認してください。

## 最初に読むファイル

${context.plan.learningPathFiles.slice(0, 8).map((file, index) => `${index + 1}. \`${file}\``).join("\n") || "README と設定ファイルから読み始めてください。"}

## 初心者向け注意点

- 認証、トークン、権限、デプロイ関連のファイルは慎重に扱ってください。
- 非公開コードでは信頼できる AI プロバイダー、またはローカルモデルを使ってください。
- 小さく変更し、テストやビルドで確認してください。
- この文書は学習用の地図であり、ソースコードを読む作業の代わりではありません。
`;
}
