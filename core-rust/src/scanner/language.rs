use std::path::Path;

pub fn detect_language(path: &Path, first_line: Option<&str>) -> String {
    let filename = path
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| format!(".{}", value.to_ascii_lowercase()))
        .unwrap_or_default();

    if filename == "dockerfile" {
        return "Dockerfile".to_string();
    }

    if let Some(line) = first_line {
        if line.starts_with("#!") {
            if line.contains("python") {
                return "Python".to_string();
            }
            if line.contains("bash") || line.contains("sh") {
                return "Shell".to_string();
            }
            if line.contains("node") {
                return "JavaScript".to_string();
            }
        }
    }

    match extension.as_str() {
        ".ts" => "TypeScript",
        ".tsx" => "TypeScript",
        ".js" | ".mjs" | ".cjs" => "JavaScript",
        ".jsx" => "JavaScript",
        ".py" => "Python",
        ".rs" => "Rust",
        ".cpp" | ".cc" | ".cxx" | ".hpp" | ".hh" | ".hxx" => "C++",
        ".c" | ".h" => "C",
        ".cs" => "C#",
        ".java" => "Java",
        ".kt" | ".kts" => "Kotlin",
        ".dart" => "Dart",
        ".html" | ".htm" => "HTML",
        ".css" | ".scss" | ".sass" => "CSS",
        ".sql" => "SQL",
        ".json" => "JSON",
        ".yaml" | ".yml" => "YAML",
        ".md" | ".mdx" => "Markdown",
        ".sh" | ".bash" | ".zsh" => "Shell",
        ".toml" => "TOML",
        ".xml" => "XML",
        _ => "Unknown",
    }
    .to_string()
}
