use std::collections::HashSet;
use std::path::Path;

const DEFAULT_IGNORES: &[&str] = &[
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    ".nuxt",
    "target",
    ".venv",
    "venv",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".idea",
    ".vscode",
    "coverage",
    ".turbo",
    ".cache",
    "vendor",
    "out",
    "bin",
    "obj",
];

pub fn ignored_names(extra: &[String]) -> HashSet<String> {
    DEFAULT_IGNORES
        .iter()
        .map(|value| value.to_string())
        .chain(extra.iter().cloned())
        .collect()
}

pub fn should_skip_dir(path: &Path, names: &HashSet<String>) -> bool {
    path.file_name()
        .and_then(|value| value.to_str())
        .map(|name| names.contains(name))
        .unwrap_or(false)
}

pub fn should_skip_file(relative_path: &str, names: &HashSet<String>) -> Option<String> {
    let normalized = relative_path.replace('\\', "/");
    let basename = normalized.rsplit('/').next().unwrap_or(&normalized);

    if names.contains(basename) {
        return Some("explicit ignore rule".to_string());
    }

    if basename == ".env" || (basename.starts_with(".env.") && !basename.ends_with(".example")) {
        return Some("secret-like environment file skipped by default".to_string());
    }

    let lowered = normalized.to_ascii_lowercase();
    if lowered.contains("/secrets/") || lowered.contains("/credentials/") {
        return Some("secret-like path skipped by default".to_string());
    }

    None
}
