#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/../core-rust"
cargo build --release
