# SourceClass

**Understand any codebase like a class.**

SourceClass is a terminal-native AI-powered source code anatomy classroom. It scans a local source code project, builds a safe project map, classifies files, plans what matters, optionally enriches the result through the AI provider selected by the user, and generates GitBook-style Markdown documentation.

Korean slogan: **모르는 코드를 수업처럼 이해한다.**

Japanese slogan: **知らないコードを授業のように理解する。**

## Philosophy

AI can write code, but many people still cannot understand code.

SourceClass exists for the gap between code generation and code comprehension. Many students, beginner developers, vibe coders, and self-taught programmers can now generate or download projects quickly, but they still struggle with the real questions:

- What is this project?
- Where does execution start?
- Which folder should I read first?
- Which files are safe to modify?
- Which files are dangerous?
- What should I study before changing this?
- What hidden security or deployment risks should I notice?
- How can this project become useful, teachable, or open-source friendly?

SourceClass turns unfamiliar repositories into structured classroom material.

## What SourceClass Is

SourceClass is:

- A CLI-first open-source engine
- A GitBook-style Markdown documentation generator
- A source code anatomy tool
- A learning engine for beginner and intermediate developers
- A provider-adapter based AI tool
- A read-only project scanner by default
- A tool that becomes stronger as external AI models improve

## What SourceClass Is Not

SourceClass is not:

- A web app
- A frontend dashboard
- A hosted SaaS
- An IDE extension
- A simple code comment generator
- A ChatGPT wrapper
- A login-based service
- A tool that ships paid AI usage
- A tool that hardcodes an API key
- A tool that modifies source code by default

There is no SourceClass server. The CLI runs locally. The user chooses a provider and supplies their own API key.

## Key Features

- Project scanner with safe default ignores
- File role classifier
- Dependency mapper
- Entry point detection
- Language and framework detection
- Token estimation
- Analysis planner to reduce AI context waste
- Optional AI provider enrichment
- OpenAI, Anthropic, Gemini, OpenRouter, and local endpoint adapters
- GitBook-style Markdown output
- Korean, English, and Japanese documentation pages
- Beginner, Pro, Ultimate, Master, Enterprise, and Education modes
- Security and privacy warnings
- Doctor command for local setup checks
- Open-source project templates and contribution guide

## Demo Command

```bash
sourceclass analyze ./my-project
```

Output:

```text
sourceclass-output/
  README.md
  SUMMARY.md
  01-introduction.md
  02-project-map.md
  03-folder-anatomy.md
  04-execution-flow.md
  05-file-roles.md
  06-beginner-explanation.md
  07-modification-guide.md
  08-learning-path.md
  09-build-and-run.md
  10-open-source-comparison.md
  11-security-notes.md
  12-business-direction.md
  13-mind-map-navigation.md
  14-30-day-code-class.md
  languages/
    ko.md
    en.md
    ja.md
  data/
    project_structure.json
    file_roles.json
    analysis_plan.json
    dependency_map.json
```

## Installation

SourceClass is a Node.js CLI written in TypeScript.

Requirements:

- Node.js 20 or newer
- npm, pnpm, or yarn
- Git is optional but recommended
- AI provider API key is optional for local metadata docs, required for AI-enriched docs

From a local clone:

```bash
git clone https://github.com/your-org/sourceclass.git
cd sourceclass
npm install
npm run build
npm link
sourceclass --help
```

Run without linking:

```bash
npm run dev -- --help
npm run dev -- analyze ./examples/sample-project --no-ai
```

## Quick Start

```bash
sourceclass init
sourceclass config
sourceclass analyze ./my-project --mode ultimate --lang ko,en,ja
```

If you do not want AI provider calls:

```bash
sourceclass analyze ./my-project --no-ai
```

SourceClass will still generate scanner-based GitBook-style documentation.

## CLI Commands

```bash
sourceclass --help
sourceclass init
sourceclass config
sourceclass analyze <path>
sourceclass explain <file>
sourceclass map <path>
sourceclass translate <path>
sourceclass compare <path>
sourceclass security <path>
sourceclass learn <path>
sourceclass doctor
sourceclass version
```

### init

Creates a local SourceClass workspace:

```text
.sourceclass/
  config.json
  providers.json
  prompts/
  cache/
  reports/
```

### config

Runs interactive setup:

- Select language: `ko`, `en`, `ja`, or all
- Select AI provider
- Input API key
- Select model
- Select output depth
- Select mode
- Save local config

### analyze

Full project analysis:

```bash
sourceclass analyze ./project
sourceclass analyze ./project --mode beginner
sourceclass analyze ./project --mode pro
sourceclass analyze ./project --mode ultimate
sourceclass analyze ./project --mode master
sourceclass analyze ./project --mode enterprise
sourceclass analyze ./project --mode education
sourceclass analyze ./project --lang ko,en,ja
sourceclass analyze ./project --provider openrouter --model openai/gpt-4.1
sourceclass analyze ./project --no-ai
```

Note: the implemented mode name for beginner-friendly default analysis is `normal`.

### explain

Explain a single file:

```bash
sourceclass explain ./src/main.ts
sourceclass explain ./src/main.ts --no-ai
```

The report is saved under `.sourceclass/reports/`.

### map

Generate project map and dependency data:

```bash
sourceclass map ./project
```

### learn

Generate a learning curriculum:

```bash
sourceclass learn ./project --lang ko,en,ja
```

### security

Generate security-oriented notes:

```bash
sourceclass security ./project
sourceclass security ./project --ai
```

Enterprise/security output is a learning and review aid, not a professional security audit.

### compare

Generate safe open-source comparison guidance:

```bash
sourceclass compare ./project --license MIT --github
```

SourceClass does not aggressively crawl repositories. It gives safe search queries and comparison criteria unless a future GitHub API integration is explicitly configured.

### doctor

Check local readiness:

- Node version
- Python version, if available
- Git availability
- Config validity
- API key availability
- Output permissions
- Project scan readiness
- Project size signals

```bash
sourceclass doctor
```

## Configuration

Default local config:

```json
{
  "provider": "openai",
  "model": "gpt-4.1",
  "language": ["ko", "en", "ja"],
  "mode": "ultimate",
  "outputDir": "sourceclass-output",
  "maxFileSizeKB": 300,
  "maxFiles": 400,
  "ignore": ["node_modules", ".git", "dist", "build", ".next", ".venv", "__pycache__"],
  "securityMode": false,
  "includeHidden": false
}
```

## API Key Setup

SourceClass strongly recommends environment variables:

```bash
export SOURCECLASS_OPENAI_API_KEY="..."
export SOURCECLASS_ANTHROPIC_API_KEY="..."
export SOURCECLASS_GEMINI_API_KEY="..."
export SOURCECLASS_OPENROUTER_API_KEY="..."
```

PowerShell:

```powershell
$env:SOURCECLASS_OPENAI_API_KEY="..."
```

Local model endpoint:

```json
{
  "provider": "local",
  "model": "llama3.1",
  "localEndpoint": "http://localhost:11434/v1/chat/completions"
}
```

If you choose to store API keys in `.sourceclass/providers.json`, SourceClass warns you first. That file is gitignored by default. Do not commit it.

## Supported AI Providers

SourceClass uses provider adapters:

- OpenAI
- Anthropic
- Google Gemini
- OpenRouter
- Local OpenAI-compatible endpoint
- Future custom providers

Provider modules live under `sourceclass/ai/`. To add a provider, implement the `AIProvider` interface and register it in `providerFactory.ts`.

## Modes

### Normal Mode

Simple code understanding:

- Project summary
- Main folders
- Main files
- Basic execution flow
- Simple explanation
- Beginner warnings

### Pro Mode

Deep code reading:

- Detailed file-by-file explanation
- Folder role analysis
- Function/class role explanation when available
- Architecture overview
- Important concepts to study
- Recommended reading order

### Ultimate Mode

Modification support:

- Everything from Pro mode
- Safe modification map
- Dangerous modification map
- Refactor suggestions
- Open-source comparison guidance
- Improvement roadmap

### Master Mode

Practical output:

- Everything from Ultimate mode
- Packaging guide
- Build guide
- Deployment guide
- Monetization possibilities
- Product direction
- Failure risk
- What to build next

### Enterprise Mode

Security-oriented notes:

- Everything from Master mode
- Security checklist
- API key exposure risks
- Dependency risks
- Permission risks
- Input validation risks
- Build/deployment risks
- Supply-chain risks
- Suggested mitigations

Enterprise Mode is not a replacement for a professional security audit.

### Education Mode

Natural-language algorithm lessons:

- Explain code like a class
- Convert code to algorithm steps
- Explain key concepts
- Give study order
- Give exercises
- Give mini quizzes
- Explain why each structure exists

## Output Folder Explanation

The output folder is designed to feel like a GitBook project:

- `README.md`: Start page and summary
- `SUMMARY.md`: GitBook navigation
- `01-introduction.md`: Project identity
- `02-project-map.md`: Folder map and detected structure
- `03-folder-anatomy.md`: Folder responsibilities
- `04-execution-flow.md`: Entry points, scripts, imports, reading flow
- `05-file-roles.md`: File role table
- `06-beginner-explanation.md`: Plain-language guide
- `07-modification-guide.md`: Safe and dangerous modification map
- `08-learning-path.md`: Reading order, exercises, quiz
- `09-build-and-run.md`: Build/run starting points
- `10-open-source-comparison.md`: Comparison guidance and search queries
- `11-security-notes.md`: Security checklist and sensitive files
- `12-business-direction.md`: Product and monetization thinking
- `13-mind-map-navigation.md`: SourceClass v3 folder-to-file-to-role navigation map
- `14-30-day-code-class.md`: SourceClass v3 one-month project learning curriculum
- `languages/`: Korean, English, Japanese pages
- `data/`: Machine-readable scan outputs

## GitBook-Style Documentation

SourceClass output can be read directly in a terminal, editor, GitHub, or GitBook-compatible Markdown tool. The generated `SUMMARY.md` follows a GitBook-like navigation structure.

The goal is not shallow comments. The goal is structured comprehension:

- Structure
- Role
- Flow
- Modification points
- Learning path
- Security notes
- Build/run guide
- Open-source comparison
- Business direction
- Mind map navigation
- 30-day code class

## Multilingual Support

SourceClass supports:

- Korean: `ko`
- English: `en`
- Japanese: `ja`

Commands:

```bash
sourceclass analyze ./project --lang ko
sourceclass analyze ./project --lang en
sourceclass analyze ./project --lang ja
sourceclass analyze ./project --lang all
sourceclass analyze ./project --lang ko,en,ja
```

Language pages are not intended to be shallow translation only. The prompt layer asks for natural explanations appropriate to each language audience.

## Security Policy Summary

SourceClass analyzes local files and may send selected snippets to the configured AI provider if AI enrichment is enabled.

Important rules:

- Your code may be sent to the selected AI provider.
- Do not analyze private code unless you trust the provider.
- Use local models for sensitive projects.
- API keys should be stored in environment variables.
- Never commit `.sourceclass/providers.json` if it contains secrets.
- SourceClass does not run uploaded code by default.
- SourceClass is read-only by default.
- SourceClass should not modify source files unless a future explicit write command is run.
- Secret-like paths are skipped by default.
- Common secret patterns are redacted before prompt construction.

See `SECURITY.md` for details.

## Privacy Policy Summary

There is no SourceClass server.

SourceClass does not provide hosted accounts, login, telemetry, or built-in paid AI. The CLI runs locally. If you enable an AI provider, your machine sends selected prompt content directly to that provider according to your provider configuration and their policies.

## Open-Source Philosophy

SourceClass should remain open-source at its core.

Acceptable optional monetization paths:

- GitHub Sponsors
- Buy Me a Coffee
- Paid consulting
- Custom enterprise deployment
- Education workshops
- A premium hosted version later, if the core CLI remains free

What should never be paywalled:

- Basic CLI analysis
- Provider adapter interface
- Core scanner
- GitBook-style Markdown output
- Security/privacy warnings
- Learning-oriented documentation generation

## Architecture

```text
sourceclass/
  cli/
    index.ts
    commands/
      init.ts
      config.ts
      analyze.ts
      explain.ts
      map.ts
      translate.ts
      compare.ts
      security.ts
      learn.ts
      doctor.ts
  core/
    projectScanner.ts
    fileClassifier.ts
    dependencyMapper.ts
    languageDetector.ts
    tokenEstimator.ts
    chunker.ts
    analysisPlanner.ts
    analysisEngine.ts
    reportGenerator.ts
    outputWriter.ts
  ai/
    provider.ts
    providerFactory.ts
    openaiProvider.ts
    anthropicProvider.ts
    geminiProvider.ts
    openrouterProvider.ts
    localProvider.ts
    promptRunner.ts
  prompts/
    system/
    languages/
  docs/
    templates/
  utils/
    fs.ts
    logger.ts
    config.ts
    markdown.ts
    git.ts
    errors.ts
tests/
  scanner.test.ts
  config.test.ts
  provider.test.ts
  markdown.test.ts
```

## Development Setup

```bash
npm install
npm run build
npm test
npm run dev -- --help
npm run dev -- analyze ./examples/sample-project --no-ai
```

## Testing

```bash
npm test
npm run typecheck
```

The initial test suite covers:

- Scanner ignore behavior and detection
- Config validation defaults
- Provider factory creation
- Markdown helper output

## Contributing

Contributions are welcome. Good first areas:

- More provider adapters
- Better framework detection
- Better dependency mapping
- More language-specific prompt tuning
- More output templates
- GitHub API comparison integration
- Local model examples
- More tests and fixtures

See `CONTRIBUTING.md`.

## Roadmap

- `v0.1`: CLI MVP, scanner, file roles, provider adapters, GitBook output
- `v0.2`: richer per-file AI analysis and caching
- `v0.3`: GitHub API comparison mode
- `v0.4`: local model privacy profiles
- `v0.5`: prompt packs and educator lesson plans
- `v0.6`: plugin/provider SDK
- `v1.0`: stable CLI API and documentation format

## FAQ

### Is SourceClass a web app?

No. SourceClass is CLI-only.

### Does SourceClass include paid AI?

No. Users provide their own API key.

### Does SourceClass upload code to SourceClass servers?

No. There is no SourceClass server.

### Can SourceClass run without AI?

Yes. Use `--no-ai` to generate scanner-based documentation. AI enrichment requires a configured provider.

### Is Enterprise Mode a security audit?

No. It is a structured learning and review aid, not a replacement for a professional security audit.

### Can I add another provider?

Yes. Implement `AIProvider`, create a provider class, and register it in `sourceclass/ai/providerFactory.ts`.

## License

MIT. See `LICENSE`.

---

## 한국어 README

SourceClass는 터미널에서 실행되는 오픈소스 코드 해부 CLI입니다.

한 줄 설명:

> 모르는 코드를 수업처럼 이해한다.

SourceClass는 웹 앱이 아닙니다. 대시보드가 아닙니다. IDE 확장이 아닙니다. 사용자가 직접 선택한 AI 제공자와 API 키를 사용해 로컬 프로젝트를 분석하고, GitBook처럼 읽을 수 있는 Markdown 문서를 생성합니다.

중요한 점:

- 사용자가 직접 API 키를 제공합니다.
- SourceClass 서버는 없습니다.
- 기본 동작은 읽기 전용입니다.
- `.env` 같은 비밀 파일은 기본적으로 건너뜁니다.
- 민감한 코드는 신뢰할 수 있는 AI 제공자 또는 로컬 모델로 분석하세요.
- 목표는 무작정 코드 생성이 아니라 코드 이해입니다.

추천 사용 대상:

- 한국 고등학생
- 한국 대학생
- 초보 개발자
- AI로 코드를 만들지만 구조를 완전히 이해하지 못하는 사람
- GitHub 프로젝트를 내려받았지만 어디서 시작할지 모르는 사람
- 코드를 고치고 싶지만 망가뜨릴까 봐 걱정되는 사람

빠른 시작:

```bash
sourceclass init
sourceclass config
sourceclass analyze ./project --mode ultimate --lang ko,en,ja
```

AI 없이 구조 문서만 만들기:

```bash
sourceclass analyze ./project --no-ai
```

생성되는 문서는 프로젝트 개요, 폴더 지도, 실행 흐름, 파일 역할, 초보자 설명, 수정 가이드, 학습 경로, 빌드 방법, 오픈소스 비교, 보안 노트, 비즈니스 방향을 포함합니다.

---

## English README

SourceClass is a CLI-only open-source source code anatomy engine.

It helps users understand unfamiliar repositories by generating structured GitBook-style Markdown documentation. It is designed for learners, beginner developers, AI coding tool users, educators, and maintainers who want better onboarding material.

SourceClass does not provide hosted AI. The user brings their own API key. Provider adapters make the engine independent from any single AI company.

Core promise:

> Understand any codebase like a class.

Run:

```bash
sourceclass analyze ./project
```

Then read:

```text
sourceclass-output/README.md
sourceclass-output/SUMMARY.md
```

---

## 日本語 README

SourceClass は、ターミナルで動作するオープンソースのコード解剖 CLI です。

キャッチコピー:

> 知らないコードを授業のように理解する。

SourceClass は Web アプリではありません。ダッシュボードでも IDE 拡張でもありません。ユーザー自身の AI API キーを使い、ローカルのソースコードを読み取り、GitBook 風の Markdown ドキュメントを生成します。

主な目的:

- プロジェクト全体の構造を理解する
- 入口となるファイルを見つける
- フォルダや重要ファイルの役割を理解する
- 安全に変更できる場所を知る
- 危険な変更箇所を知る
- 学習順序を作る
- セキュリティ上の注意点を確認する

基本コマンド:

```bash
sourceclass init
sourceclass config
sourceclass analyze ./project --lang ja
```

SourceClass の目的は、盲目的なコード生成ではなく、コードを理解して成長できるようにすることです。
