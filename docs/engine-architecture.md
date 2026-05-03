# SourceClass Engine Architecture

SourceClass remains CLI-first.

The existing TypeScript layer owns:

- CLI command definitions
- User config
- API key input
- Provider selection UI
- Terminal UX
- Command routing
- Calling external engines

The engine layer added here sits behind that CLI.

## Pipeline

```text
TypeScript CLI
  -> core-rust scan ./project --out .sourceclass/cache/project_map.json
  -> python engine-python/analyze.py --project-map .sourceclass/cache/project_map.json --mode ultimate --lang ko,en,ja --out sourceclass-output
  -> sourceclass-output GitBook-style Markdown
```

## Rust Core

Rust performs fast local scanning only.

It does:

- Recursive walk
- Ignore handling
- Metadata extraction
- Binary detection
- Language detection
- Role hints
- Dependency hints
- Hash cache
- Chunk planning
- Project graph JSON

It does not:

- Call AI APIs
- Generate final Markdown reports
- Execute target project code
- Install dependencies
- Modify source files

## Python Engine

Python consumes the Rust `project_map.json`.

It does:

- Validate the schema
- Plan analysis
- Select important files
- Build provider prompts
- Call the selected AI provider when not in mock mode
- Generate GitBook-style Markdown
- Generate Korean, English, and Japanese pages
- Generate security, learning, modification, and comparison sections
- Generate v3 mind-map navigation and 30-day learning curriculum

It does not:

- Replace the Rust scanner
- Scan large folders itself
- Own CLI UX
- Store API keys

## Optional C++

`native-cpp/` is an optional acceleration skeleton for future large-file preprocessing. The MVP works without it.

## Privacy Model

There is no SourceClass server in this engine design. API keys remain user-owned and are read from environment variables by the Python provider adapters. Rust does not call AI providers. Python can run in `--mock` mode without network calls.
