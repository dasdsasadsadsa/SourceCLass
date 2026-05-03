#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/../engine-python"
python -m venv .venv

if [ -x ".venv/bin/python" ]; then
  .venv/bin/python -m pip install --upgrade pip
  .venv/bin/python -m pip install -r requirements.txt
else
  .venv/Scripts/python.exe -m pip install --upgrade pip
  .venv/Scripts/python.exe -m pip install -r requirements.txt
fi
