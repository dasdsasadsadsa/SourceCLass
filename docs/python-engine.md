# Python Engine

The Python engine converts Rust project maps into GitBook-style documentation.

Location:

```text
engine-python/
```

Run:

```bash
python engine-python/analyze.py \
  --project-map .sourceclass/cache/project_map.json \
  --mode ultimate \
  --lang ko,en,ja \
  --out sourceclass-output \
  --mock
```

## Mock Mode

Mock mode is required for contributors and CI:

```bash
python engine-python/analyze.py \
  --project-map .sourceclass/cache/project_map.json \
  --mode ultimate \
  --lang ko,en,ja \
  --out sourceclass-output \
  --mock
```

It does not call any AI provider.

## Provider Mode

Provider mode reads API keys from environment variables:

- `SOURCECLASS_OPENAI_API_KEY`
- `SOURCECLASS_ANTHROPIC_API_KEY`
- `SOURCECLASS_GEMINI_API_KEY`
- `SOURCECLASS_OPENROUTER_API_KEY`
- `SOURCECLASS_LOCAL_ENDPOINT`

Example:

```bash
SOURCECLASS_OPENAI_API_KEY=... python engine-python/analyze.py \
  --project-map .sourceclass/cache/project_map.json \
  --provider openai \
  --model gpt-4.1 \
  --mode ultimate \
  --out sourceclass-output
```

## Modes

Supported modes:

- `normal`
- `beginner`
- `pro`
- `ultimate`
- `master`
- `enterprise`
- `education`

Mode affects prompt style, output depth, and file selection priority.

## Output

Python writes:

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
    project_map.json
    analysis_plan.json
    file_roles.json
    dependency_hints.json
    mind_map.json
    monthly_curriculum.json
```

## Security

The Python engine does not store API keys. It does not write API keys to generated docs. Security analysis is best-effort and not a professional audit.
