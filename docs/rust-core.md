# Rust Core

The Rust core is a fast local scanner.

Location:

```text
core-rust/
```

Build:

```bash
cd core-rust
cargo build --release
```

Run:

```bash
cargo run -- scan ../examples/tiny-python-project \
  --out ../.sourceclass/cache/project_map.json \
  --cache ../.sourceclass/cache \
  --max-file-size-kb 300
```

Compiled binary:

```bash
core-rust/target/release/sourceclass-core scan ./project \
  --out .sourceclass/cache/project_map.json
```

## Scanner Rules

Rust skips ignored directories before descending. Default ignored names:

```text
node_modules, .git, dist, build, .next, .nuxt, target, .venv, venv,
__pycache__, .pytest_cache, .mypy_cache, .idea, .vscode, coverage,
.turbo, .cache, vendor, out, bin, obj
```

Rust also skips `.env` and secret-like paths by default.

## Binary Detection

Rust reads the first 8192 bytes and marks a file binary when:

- A null byte is present
- Control-byte ratio is high
- UTF-8 appears invalid with suspicious bytes

Binary files are excluded from chunk plans.

## Language Detection

Rust detects language by extension first, then selected filename/shebang hints.

Supported languages include TypeScript, JavaScript, Python, Rust, C++, C, C#, Java, Kotlin, Dart, HTML, CSS, SQL, JSON, YAML, Markdown, Shell, Dockerfile, and TOML.

## Dependency Hints

Dependency hints are lightweight and best-effort. They are not a complete compiler graph.

Supported hints:

- TypeScript/JavaScript imports, requires, exports
- Python imports
- Rust `use`, `mod`, `extern crate`
- Java/Kotlin imports and packages
- C/C++ includes
- C# using statements
- Dart imports

## Safety

Rust never executes target project code and never calls AI APIs.
