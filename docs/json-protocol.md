# SourceClass JSON Protocol

The engine layers communicate through JSON files.

## Project Map

Rust writes:

```bash
sourceclass-core scan ./project \
  --out .sourceclass/cache/project_map.json \
  --cache .sourceclass/cache \
  --max-file-size-kb 300
```

Schema:

```json
{
  "schemaVersion": "sourceclass.projectMap.v1",
  "projectRoot": "/absolute/path",
  "generatedAt": "ISO_DATE",
  "stats": {
    "totalFiles": 0,
    "includedFiles": 0,
    "ignoredFiles": 0,
    "totalBytes": 0,
    "languageBreakdown": {}
  },
  "detectedStack": {
    "languages": [],
    "frameworks": [],
    "packageManagers": [],
    "buildTools": [],
    "entryPoints": []
  },
  "files": [
    {
      "path": "src/index.ts",
      "absolutePath": "/absolute/path/src/index.ts",
      "sizeBytes": 1200,
      "language": "TypeScript",
      "extension": ".ts",
      "hash": "sha256:...",
      "isBinary": false,
      "isIgnored": false,
      "cacheHit": false,
      "roleHints": ["entry_point"],
      "dependencyHints": ["commander", "./commands/analyze"],
      "chunkPlan": [
        {
          "chunkId": "src/index.ts::0",
          "startLine": 1,
          "endLine": 120,
          "estimatedTokens": 900,
          "reason": "small_file",
          "includesHeaderContext": false
        }
      ]
    }
  ],
  "folders": [
    {
      "path": "src",
      "fileCount": 10,
      "roleHints": ["source"]
    }
  ],
  "warnings": []
}
```

## Cache Index

Rust writes:

```text
.sourceclass/cache/index.json
```

Cache entries include:

- path
- size
- modified time
- content hash
- language
- role hints
- dependency hints
- chunk plan
- binary flag

If size and modified time match, Rust reuses cached metadata. If those differ but the hash is unchanged, Rust also reuses safe metadata and marks the file as a cache hit.

## Python Output Data

Python writes:

```text
sourceclass-output/data/
  project_map.json
  analysis_plan.json
  file_roles.json
  dependency_hints.json
  mind_map.json
  monthly_curriculum.json
```

The TypeScript CLI can read these files later for summaries, re-runs, or UI-neutral integrations.

## v3 Navigation Data

`mind_map.json` is a CLI-neutral navigation model for the v3 UX layer. It groups files by folder and keeps language, role hints, dependency hints, and chunk counts.

`monthly_curriculum.json` stores the generated 30-day learning plan. The Markdown page is human-readable; the JSON file is meant for future CLI commands or external renderers.
