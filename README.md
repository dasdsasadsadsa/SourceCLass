v4까지 만들었으나 최종적으로는 폐기했습니다. 

폐기프로젝트 MD

# SourceClass V4

**A mapping-based code search engine with LLM-assisted code intelligence.**

SourceClass V4 turns a local repository into an explorable project map. It extracts files, folders, classes, interfaces, structs, functions, methods, imports, call-like relationships, file roles, and centrality scores, then exposes them through CLI commands for map browsing, file summaries, code classification, fuzzy search, and selected-element explanation.

This directory is the real V4 implementation built on the V3 frame. The fake V4 and Qwen-generated V6 folders are not used as the product base.

## V4 Boundary

SourceClass V4 keeps deterministic static analysis separate from optional LLM explanation.

- Static map: local, fast, deterministic, and safe by default.
- LLM explanations: optional, cache-aware, evidence/inference separated, and marked as LLM-backed when a provider is used.
- UI contract: the CLI now exposes the same map, summary, render, search, and underline-style explain flows that a GUI can consume later.

## Commands

Build an interactive structural map:

```bash
npm run build
node dist/cli/index.js v4-map ./my-project
```

Show a high-quality file summary:

```bash
node dist/cli/index.js v4-summary ./my-project --file src/main.ts
```

Search mapped files and symbols:

```bash
node dist/cli/index.js v4-search ./my-project "UserService"
```

Render code classification blocks:

```bash
node dist/cli/index.js v4-render ./my-project --file src/service.ts
```

Explain a selected element:

```bash
node dist/cli/index.js v4-explain ./my-project --file src/service.ts --symbol createUser
```

Use `--no-ai` to force local static explanation. Without `--no-ai`, the command uses the configured SourceClass provider when an API key or local endpoint is available, then caches the result under `.sourceclass-v4/cache/explanations`.

Launch the Slint desktop GUI:

```bash
npm run gui
node dist/cli/index.js v4-gui ./my-project
node dist/cli/index.js gui ./my-project
```

The GUI command is always registered. If the Slint executable is missing, the CLI auto-builds it with Cargo unless `--no-build` is passed.

## What The V4 Map Contains

- Collapsible tree-compatible directory, file, and symbol nodes.
- File roles: entry, brain, utility, data model, configuration, connector, interface, output, test, documentation, unknown.
- Structural symbols: class, object, interface, trait, struct, enum, function, method, constructor, constant, type alias, module, namespace.
- Relationships: contains, imports, depends_on, extends, implements, calls, uses, references.
- Centrality scores for files and symbols.
- Import grouping into internal and external dependencies.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

The V3 documentation generator commands are still present in the frame, but the V4 command surface is implemented by:

- `sourceclass/core/v4Types.ts`
- `sourceclass/core/v4SymbolExtractor.ts`
- `sourceclass/core/v4MappingEngine.ts`
- `sourceclass/core/v4Explainer.ts`
- `sourceclass/cli/commands/v4.ts`
- `gui-slint/`
- `bridge-python/`

## Safe Slint Executable

The Slint GUI lives in `gui-slint/` and builds to:

```text
gui-slint/target/release/sourceclass-v4-gui.exe
```

It is a read-only desktop explorer. It scans project files into memory, renders a high-density map/search/summary interface, and does not modify project files, invoke package scripts, or call LLM/network providers. Slint is pinned to `=1.14.0` because this workspace currently uses Rust 1.88, and Slint 1.14 declares Rust 1.88 support.

Build it directly:

```bash
npm run gui:build
cargo build --release --manifest-path gui-slint/Cargo.toml
```

Compatibility launch through Python is also available:

```bash
python bridge-python/main.py gui ./my-project
```

## Status

V4 is the explorable-understanding foundation. V5 should build modification planning on top of this map instead of replacing it.
