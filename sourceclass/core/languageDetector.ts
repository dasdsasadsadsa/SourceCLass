import path from "node:path";

const extensionLanguageMap: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript React",
  ".js": "JavaScript",
  ".jsx": "JavaScript React",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",
  ".py": "Python",
  ".java": "Java",
  ".kt": "Kotlin",
  ".kts": "Kotlin",
  ".cs": "C#",
  ".go": "Go",
  ".rs": "Rust",
  ".cpp": "C++",
  ".cc": "C++",
  ".cxx": "C++",
  ".c": "C",
  ".h": "C/C++ Header",
  ".hpp": "C++ Header",
  ".dart": "Dart",
  ".php": "PHP",
  ".rb": "Ruby",
  ".swift": "Swift",
  ".scala": "Scala",
  ".sql": "SQL",
  ".html": "HTML",
  ".css": "CSS",
  ".scss": "SCSS",
  ".json": "JSON",
  ".yaml": "YAML",
  ".yml": "YAML",
  ".toml": "TOML",
  ".xml": "XML",
  ".md": "Markdown",
  ".sh": "Shell",
  ".ps1": "PowerShell",
  ".bat": "Batch",
  ".dockerfile": "Dockerfile"
};

export function detectLanguage(filePath: string): string {
  const lower = filePath.toLowerCase();
  const ext = path.extname(lower);

  if (path.basename(lower) === "dockerfile") {
    return "Dockerfile";
  }

  return extensionLanguageMap[ext] ?? "Unknown";
}

export function isCodeLanguage(language: string): boolean {
  return !["Unknown", "Markdown", "JSON", "YAML", "TOML", "XML", "HTML", "CSS", "SCSS"].includes(language);
}
