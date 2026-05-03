#!/usr/bin/env sh
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT/core-rust"
cargo build --release

cd "$ROOT"
mkdir -p .sourceclass/cache
./core-rust/target/release/sourceclass-core scan ./examples/tiny-python-project \
  --out ./.sourceclass/cache/project_map.json \
  --cache ./.sourceclass/cache \
  --max-file-size-kb 300

python ./engine-python/analyze.py \
  --project-map ./.sourceclass/cache/project_map.json \
  --mode ultimate \
  --lang ko,en,ja \
  --out ./sourceclass-output \
  --mock

test -f ./sourceclass-output/README.md
test -f ./sourceclass-output/SUMMARY.md
test -f ./sourceclass-output/data/project_map.json

echo "SourceClass engine smoke test passed."
