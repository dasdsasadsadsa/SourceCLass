use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use chrono::Utc;

use crate::chunker::plan_chunks;
use crate::graph::dependency_hints::extract_dependency_hints;
use crate::graph::project_graph::{build_detected_stack, build_folders};
use crate::indexer::cache::{load_cache, save_cache, CacheEntry, CacheIndex};
use crate::indexer::file_index::modified_unix;
use crate::indexer::hash::sha256_file;
use crate::output::project_map::{FileNode, ProjectMap, ProjectStats};
use crate::scanner::binary::is_binary;
use crate::scanner::ignore::{ignored_names, should_skip_dir, should_skip_file};
use crate::scanner::language::detect_language;
use crate::scanner::metadata::{classify_role_hints, extension_for};

#[derive(Debug, Clone)]
pub struct ScanConfig {
    pub output_path: PathBuf,
    pub cache_dir: PathBuf,
    pub max_file_size_kb: u64,
    pub extra_ignores: Vec<String>,
}

pub fn scan_project(project_path: &Path, config: &ScanConfig) -> Result<ProjectMap> {
    let root = project_path
        .canonicalize()
        .with_context(|| format!("resolve project root {}", project_path.display()))?;
    let ignored_names = ignored_names(&config.extra_ignores);
    let mut warnings = Vec::new();
    let mut files = Vec::new();
    let mut stats = ProjectStats::default();
    let mut cache = load_cache(&config.cache_dir);
    cache.schema_version = "sourceclass.cacheIndex.v1".to_string();
    let mut next_cache = CacheIndex {
        schema_version: "sourceclass.cacheIndex.v1".to_string(),
        entries: BTreeMap::new(),
    };

    let mut stack = vec![root.clone()];
    while let Some(directory) = stack.pop() {
        let read_dir = match fs::read_dir(&directory) {
            Ok(value) => value,
            Err(error) => {
                warnings.push(format!(
                    "Cannot read directory {}: {}",
                    directory.display(),
                    error
                ));
                continue;
            }
        };

        for entry in read_dir.flatten() {
            let path = entry.path();
            let metadata = match fs::symlink_metadata(&path) {
                Ok(value) => value,
                Err(error) => {
                    warnings.push(format!(
                        "Cannot read metadata {}: {}",
                        path.display(),
                        error
                    ));
                    continue;
                }
            };

            if metadata.file_type().is_symlink() {
                stats.ignored_files += 1;
                warnings.push(format!(
                    "Skipped symlink {}",
                    display_relative(&root, &path)
                ));
                continue;
            }

            if metadata.is_dir() {
                if should_skip_dir(&path, &ignored_names) {
                    stats.ignored_files += 1;
                    continue;
                }
                stack.push(path);
                continue;
            }

            if !metadata.is_file() {
                stats.ignored_files += 1;
                continue;
            }

            stats.total_files += 1;
            let relative = display_relative(&root, &path);

            if let Some(reason) = should_skip_file(&relative, &ignored_names) {
                stats.ignored_files += 1;
                warnings.push(format!("Skipped {}: {}", relative, reason));
                continue;
            }

            if metadata.len() > config.max_file_size_kb * 1024 {
                stats.ignored_files += 1;
                warnings.push(format!(
                    "Skipped {}: larger than {}KB",
                    relative, config.max_file_size_kb
                ));
                continue;
            }

            let modified = metadata.modified().map(modified_unix).unwrap_or_default();
            let node = index_file(
                &root,
                &path,
                &relative,
                metadata.len(),
                modified,
                &mut cache,
                &mut next_cache,
                &mut warnings,
            )?;
            stats.included_files += 1;
            stats.total_bytes += node.size_bytes;
            *stats
                .language_breakdown
                .entry(node.language.clone())
                .or_insert(0) += 1;
            files.push(node);
        }
    }

    files.sort_by(|a, b| a.path.cmp(&b.path));
    let detected_stack = build_detected_stack(&files);
    let folders = build_folders(&files);
    save_cache(&config.cache_dir, &next_cache)?;

    Ok(ProjectMap {
        schema_version: "sourceclass.projectMap.v1".to_string(),
        project_root: normalize_display_path(&root),
        generated_at: Utc::now().to_rfc3339(),
        stats,
        detected_stack,
        files,
        folders,
        warnings,
    })
}

fn index_file(
    root: &Path,
    path: &Path,
    relative: &str,
    size_bytes: u64,
    modified_unix: u64,
    cache: &mut CacheIndex,
    next_cache: &mut CacheIndex,
    warnings: &mut Vec<String>,
) -> Result<FileNode> {
    if let Some(previous) = cache.entries.get(relative) {
        if previous.size_bytes == size_bytes && previous.modified_unix == modified_unix {
            let node = file_node_from_cache(root, path, previous, true);
            next_cache
                .entries
                .insert(relative.to_string(), previous.clone());
            return Ok(node);
        }
    }

    let binary = is_binary(path).unwrap_or_else(|error| {
        warnings.push(format!(
            "Binary detection failed for {}: {}",
            relative, error
        ));
        true
    });
    let hash = sha256_file(path)?;

    if let Some(previous) = cache.entries.get(relative) {
        if previous.hash == hash {
            let mut reused = previous.clone();
            reused.size_bytes = size_bytes;
            reused.modified_unix = modified_unix;
            reused.is_binary = binary;
            next_cache
                .entries
                .insert(relative.to_string(), reused.clone());
            return Ok(file_node_from_cache(root, path, &reused, true));
        }
    }

    let content = if binary {
        String::new()
    } else {
        fs::read_to_string(path).unwrap_or_else(|error| {
            warnings.push(format!("Text read failed for {}: {}", relative, error));
            String::new()
        })
    };
    let first_line = content.lines().next();
    let language = detect_language(path, first_line);
    let role_hints = classify_role_hints(relative, &language);
    let dependency_hints = if binary {
        Vec::new()
    } else {
        extract_dependency_hints(&language, &content)
    };
    let chunk_plan = if binary || content.is_empty() {
        Vec::new()
    } else {
        plan_chunks(relative, &language, &content, 2200)
    };

    let entry = CacheEntry {
        path: relative.to_string(),
        size_bytes,
        modified_unix,
        hash,
        language,
        role_hints,
        dependency_hints,
        chunk_plan,
        is_binary: binary,
    };
    let node = file_node_from_cache(root, path, &entry, false);
    next_cache.entries.insert(relative.to_string(), entry);
    Ok(node)
}

fn file_node_from_cache(root: &Path, path: &Path, entry: &CacheEntry, cache_hit: bool) -> FileNode {
    FileNode {
        path: entry.path.clone(),
        absolute_path: normalize_display_path(
            &path
                .canonicalize()
                .unwrap_or_else(|_| root.join(&entry.path)),
        ),
        size_bytes: entry.size_bytes,
        language: entry.language.clone(),
        extension: extension_for(Path::new(&entry.path)),
        hash: entry.hash.clone(),
        is_binary: entry.is_binary,
        is_ignored: false,
        cache_hit,
        role_hints: entry.role_hints.clone(),
        dependency_hints: entry.dependency_hints.clone(),
        chunk_plan: entry.chunk_plan.clone(),
    }
}

fn display_relative(root: &Path, path: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}

fn normalize_display_path(path: &Path) -> String {
    let normalized = path.to_string_lossy().replace('\\', "/");
    normalized
        .strip_prefix("//?/")
        .unwrap_or(&normalized)
        .to_string()
}
