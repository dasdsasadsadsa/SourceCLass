use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMap {
    #[serde(rename = "schemaVersion")]
    pub schema_version: String,
    #[serde(rename = "projectRoot")]
    pub project_root: String,
    #[serde(rename = "generatedAt")]
    pub generated_at: String,
    pub stats: ProjectStats,
    #[serde(rename = "detectedStack")]
    pub detected_stack: DetectedStack,
    pub files: Vec<FileNode>,
    pub folders: Vec<FolderNode>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ProjectStats {
    #[serde(rename = "totalFiles")]
    pub total_files: u64,
    #[serde(rename = "includedFiles")]
    pub included_files: u64,
    #[serde(rename = "ignoredFiles")]
    pub ignored_files: u64,
    #[serde(rename = "totalBytes")]
    pub total_bytes: u64,
    #[serde(rename = "languageBreakdown")]
    pub language_breakdown: BTreeMap<String, u64>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct DetectedStack {
    pub languages: Vec<String>,
    pub frameworks: Vec<String>,
    #[serde(rename = "packageManagers")]
    pub package_managers: Vec<String>,
    #[serde(rename = "buildTools")]
    pub build_tools: Vec<String>,
    #[serde(rename = "entryPoints")]
    pub entry_points: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileNode {
    pub path: String,
    #[serde(rename = "absolutePath")]
    pub absolute_path: String,
    #[serde(rename = "sizeBytes")]
    pub size_bytes: u64,
    pub language: String,
    pub extension: String,
    pub hash: String,
    #[serde(rename = "isBinary")]
    pub is_binary: bool,
    #[serde(rename = "isIgnored")]
    pub is_ignored: bool,
    #[serde(rename = "cacheHit")]
    pub cache_hit: bool,
    #[serde(rename = "roleHints")]
    pub role_hints: Vec<String>,
    #[serde(rename = "dependencyHints")]
    pub dependency_hints: Vec<String>,
    #[serde(rename = "chunkPlan")]
    pub chunk_plan: Vec<ChunkPlan>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkPlan {
    #[serde(rename = "chunkId")]
    pub chunk_id: String,
    #[serde(rename = "startLine")]
    pub start_line: usize,
    #[serde(rename = "endLine")]
    pub end_line: usize,
    #[serde(rename = "estimatedTokens")]
    pub estimated_tokens: usize,
    pub reason: String,
    #[serde(rename = "includesHeaderContext")]
    pub includes_header_context: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FolderNode {
    pub path: String,
    #[serde(rename = "fileCount")]
    pub file_count: u64,
    #[serde(rename = "roleHints")]
    pub role_hints: Vec<String>,
}
