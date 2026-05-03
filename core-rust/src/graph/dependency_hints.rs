use std::collections::BTreeSet;

use regex::Regex;

pub fn extract_dependency_hints(language: &str, content: &str) -> Vec<String> {
    let mut hints = BTreeSet::new();

    match language {
        "TypeScript" | "JavaScript" => {
            collect_regex(
                content,
                r#"(?m)^\s*import\s+(?:.+?\s+from\s+)?["']([^"']+)["']"#,
                &mut hints,
            );
            collect_regex(
                content,
                r#"(?m)\brequire\(\s*["']([^"']+)["']\s*\)"#,
                &mut hints,
            );
            collect_regex(
                content,
                r#"(?m)^\s*export\s+.+?\s+from\s+["']([^"']+)["']"#,
                &mut hints,
            );
        }
        "Python" => {
            collect_regex(
                content,
                r#"(?m)^\s*import\s+([A-Za-z0-9_.,\s]+)"#,
                &mut hints,
            );
            collect_regex(
                content,
                r#"(?m)^\s*from\s+([A-Za-z0-9_.]+)\s+import\s+"#,
                &mut hints,
            );
        }
        "Rust" => {
            collect_regex(content, r#"(?m)^\s*use\s+([^;]+);"#, &mut hints);
            collect_regex(content, r#"(?m)^\s*mod\s+([A-Za-z0-9_]+);"#, &mut hints);
            collect_regex(
                content,
                r#"(?m)^\s*extern\s+crate\s+([A-Za-z0-9_]+)"#,
                &mut hints,
            );
        }
        "Java" | "Kotlin" => {
            collect_regex(content, r#"(?m)^\s*import\s+([A-Za-z0-9_.*]+)"#, &mut hints);
            collect_regex(content, r#"(?m)^\s*package\s+([A-Za-z0-9_.]+)"#, &mut hints);
        }
        "C++" | "C" => {
            collect_regex(
                content,
                r#"(?m)^\s*#include\s+[<"]([^>"]+)[>"]"#,
                &mut hints,
            );
        }
        "C#" => {
            collect_regex(content, r#"(?m)^\s*using\s+([A-Za-z0-9_.]+);"#, &mut hints);
        }
        "Dart" => {
            collect_regex(content, r#"(?m)^\s*import\s+['"]([^'"]+)['"]"#, &mut hints);
        }
        _ => {}
    }

    hints.into_iter().take(100).collect()
}

fn collect_regex(content: &str, pattern: &str, hints: &mut BTreeSet<String>) {
    let Ok(regex) = Regex::new(pattern) else {
        return;
    };

    for capture in regex.captures_iter(content) {
        if let Some(value) = capture.get(1) {
            for part in value.as_str().split(',') {
                let cleaned = part.trim().trim_end_matches(';').to_string();
                if !cleaned.is_empty() {
                    hints.insert(cleaned);
                }
            }
        }
    }
}
