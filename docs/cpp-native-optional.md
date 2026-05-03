# Optional C++ Native Layer

`native-cpp/` is an optional acceleration skeleton.

The MVP does not require it.

Build:

```bash
cmake -S native-cpp -B native-cpp/build
cmake --build native-cpp/build
```

Current functions:

- `count_lines`
- `estimate_token_density`
- `find_safe_split_points`
- `extract_basic_symbols`
- `detect_comment_regions`

Future integration options:

- Rust FFI
- Python extension
- Standalone CLI wrapper
- TypeScript child process

This layer should stay optional. SourceClass must continue to work with TypeScript CLI, Rust scanner, and Python engine only.
