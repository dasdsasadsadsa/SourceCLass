# SourceClass

**Try to understand any codebase like a class.**

> ⚠️ Note
> This is not a finished product.
> SourceClass is currently a small starting point and an experimental research project.
> It is intended for learning, exploration, and open-source experimentation.

SourceClass is a terminal-native AI-powered source code anatomy classroom. It scans a local source code project, builds a safe project map, classifies files, plans what matters, optionally enriches the result through the AI provider selected by the user, and generates GitBook-style Markdown documentation.

Korean slogan: **모르는 코드를 수업처럼 이해한다.**
Japanese slogan: **知らないコードを授業のように理解する。**

---

## Philosophy

AI can write code, but many people still cannot understand code.

SourceClass exists for the gap between code generation and code comprehension. Many students, beginner developers, vibe coders, and self-taught programmers can now generate or download projects quickly, but they still struggle with the real questions:

* What is this project?
* Where does execution start?
* Which folder should I read first?
* Which files are safe to modify?
* Which files are dangerous?
* What should I study before changing this?
* What hidden risks should I notice?
* How can this project become useful or teachable?

SourceClass tries to turn unfamiliar repositories into structured classroom material.

---

## Current State

SourceClass is still in an early stage.

The current version should be seen as:

* A research prototype
* A learning-oriented tool
* A foundation for future development

It may be incomplete, unstable, or subject to major changes.

---

## What SourceClass Is

* A CLI-first open-source engine
* A GitBook-style Markdown documentation generator
* A source code anatomy tool
* A learning support tool for developers
* A provider-adapter based AI tool
* A read-only project scanner by default

---

## What SourceClass Is Not

* Not a web app
* Not a dashboard
* Not a hosted SaaS
* Not an IDE extension
* Not a simple code comment generator
* Not a ChatGPT wrapper
* Not a login-based service
* Not a tool with built-in paid AI

There is no SourceClass server. The CLI runs locally. The user chooses a provider and supplies their own API key.

---

## Key Features

* Project scanner with safe default ignores
* File role classifier
* Dependency hints
* Entry point detection
* Language detection
* Token estimation
* Analysis planner (reduce AI context waste)
* Optional AI provider enrichment
* GitBook-style Markdown output
* Multilingual output (ko / en / ja)
* Multiple modes (normal, pro, ultimate, etc.)
* Security and privacy warnings

---

## Demo

```bash
sourceclass analyze ./my-project
```

---

## Installation

```bash
git clone https://github.com/your-org/sourceclass.git
cd sourceclass
npm install
npm run build
npm link
```

---

## Quick Start

```bash
sourceclass init
sourceclass config
sourceclass analyze ./project --mode ultimate --lang ko,en,ja
```

No AI mode:

```bash
sourceclass analyze ./project --no-ai
```

---

## CLI Commands

```bash
sourceclass analyze <path>
sourceclass explain <file>
sourceclass map <path>
sourceclass learn <path>
sourceclass security <path>
sourceclass compare <path>
sourceclass doctor
```

---

## Output

```text
sourceclass-output/
  README.md
  SUMMARY.md
  01-introduction.md
  ...
  14-30-day-code-class.md
```

---

## Security & Privacy

* SourceClass does not run project code
* SourceClass is read-only by default
* API keys are user-provided
* Secret-like files are skipped
* Some code may be sent to AI providers if enabled

Use trusted providers or local models for sensitive code.

---

## Open Source Philosophy

SourceClass is intended to remain open-source at its core.

This project is not trying to compete with large companies or existing platforms.

It is a small, independent attempt to explore a different direction:
helping people understand code, not just generate it.

If it is useful, feel free to:

* experiment with it
* learn from it
* modify it
* build on top of it

---

## Development

```bash
npm install
npm run build
npm test
```

---

## Roadmap (Simple)

* v1: CLI + scanner + output
* v2: hybrid engine (Rust + Python)
* v3: navigation + learning system

---

## License

MIT
