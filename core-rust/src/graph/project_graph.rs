use std::collections::{BTreeMap, BTreeSet};
use std::path::Path;

use crate::output::project_map::{DetectedStack, FileNode, FolderNode};

pub fn build_detected_stack(files: &[FileNode]) -> DetectedStack {
    let mut languages = BTreeSet::new();
    let mut frameworks = BTreeSet::new();
    let mut package_managers = BTreeSet::new();
    let mut build_tools = BTreeSet::new();
    let mut entry_points = BTreeSet::new();

    for file in files {
        if file.language != "Unknown" {
            languages.insert(file.language.clone());
        }

        let lower = file.path.to_ascii_lowercase();
        if lower == "package.json" {
            package_managers.insert("npm".to_string());
        }
        if lower == "pnpm-lock.yaml" {
            package_managers.insert("pnpm".to_string());
        }
        if lower == "yarn.lock" {
            package_managers.insert("yarn".to_string());
        }
        if lower == "requirements.txt" || lower == "pyproject.toml" {
            package_managers.insert("python".to_string());
        }
        if lower == "cargo.toml" {
            package_managers.insert("cargo".to_string());
        }
        if lower == "go.mod" {
            package_managers.insert("go".to_string());
        }
        if lower == "pom.xml" {
            package_managers.insert("maven".to_string());
        }
        if lower.ends_with("build.gradle") || lower.ends_with("build.gradle.kts") {
            package_managers.insert("gradle".to_string());
        }

        if lower == "dockerfile" {
            build_tools.insert("docker".to_string());
        }
        if lower == "makefile" {
            build_tools.insert("make".to_string());
        }
        if lower.contains("vite.config") {
            frameworks.insert("vite".to_string());
        }
        if lower.contains("next.config") {
            frameworks.insert("next".to_string());
        }
        if lower.contains("tailwind.config") {
            frameworks.insert("tailwind".to_string());
        }

        if file.role_hints.iter().any(|hint| hint == "entry_point") {
            entry_points.insert(file.path.clone());
        }
    }

    DetectedStack {
        languages: languages.into_iter().collect(),
        frameworks: frameworks.into_iter().collect(),
        package_managers: package_managers.into_iter().collect(),
        build_tools: build_tools.into_iter().collect(),
        entry_points: entry_points.into_iter().collect(),
    }
}

pub fn build_folders(files: &[FileNode]) -> Vec<FolderNode> {
    let mut folders: BTreeMap<String, (u64, BTreeSet<String>)> = BTreeMap::new();

    for file in files {
        let folder = Path::new(&file.path)
            .parent()
            .and_then(|value| value.to_str())
            .filter(|value| !value.is_empty())
            .unwrap_or("/")
            .replace('\\', "/");
        let entry = folders
            .entry(folder)
            .or_insert_with(|| (0, BTreeSet::new()));
        entry.0 += 1;
        for hint in &file.role_hints {
            entry.1.insert(folder_role_hint(hint).to_string());
        }
    }

    folders
        .into_iter()
        .map(|(path, (file_count, hints))| FolderNode {
            path,
            file_count,
            role_hints: hints.into_iter().collect(),
        })
        .collect()
}

fn folder_role_hint(file_hint: &str) -> &str {
    match file_hint {
        "entry_point" | "possible_entry_point" | "cli" => "execution",
        "api" | "route" => "interface",
        "component" | "page" => "ui",
        "database" | "model" => "data",
        "test" => "test",
        "documentation" => "documentation",
        "build_script" | "dependency_manifest" | "lockfile" => "tooling",
        "security_sensitive" | "environment" => "security_sensitive",
        _ => "source",
    }
}
