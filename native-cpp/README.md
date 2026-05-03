# SourceClass Native C++ Skeleton

This folder is an optional native acceleration layer for future SourceClass releases.

The MVP does not require C++.

Required MVP pipeline:

```text
TypeScript CLI -> Rust scanner -> Python analysis engine -> GitBook Markdown output
```

Future C++ use cases:

- Faster line counting for very large files
- Token density estimation
- Safe split point discovery
- Basic symbol hints
- Comment region detection

Build:

```bash
cmake -S native-cpp -B native-cpp/build
cmake --build native-cpp/build
```

The C++ module currently exposes C++ functions in `include/sourceclass_native.h`. A stable C ABI or CLI wrapper can be added later without making this layer mandatory.
