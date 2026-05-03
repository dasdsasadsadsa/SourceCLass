use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::output::project_map::ChunkPlan;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CacheIndex {
    #[serde(rename = "schemaVersion")]
    pub schema_version: String,
    pub entries: BTreeMap<String, CacheEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEntry {
    pub path: String,
    #[serde(rename = "sizeBytes")]
    pub size_bytes: u64,
    #[serde(rename = "modifiedUnix")]
    pub modified_unix: u64,
    pub hash: String,
    pub language: String,
    #[serde(rename = "roleHints")]
    pub role_hints: Vec<String>,
    #[serde(rename = "dependencyHints")]
    pub dependency_hints: Vec<String>,
    #[serde(rename = "chunkPlan")]
    pub chunk_plan: Vec<ChunkPlan>,
    #[serde(rename = "isBinary")]
    pub is_binary: bool,
}

pub fn cache_file(cache_dir: &Path) -> PathBuf {
    cache_dir.join("index.json")
}

pub fn load_cache(cache_dir: &Path) -> CacheIndex {
    let path = cache_file(cache_dir);
    let Ok(content) = fs::read_to_string(path) else {
        return CacheIndex {
            schema_version: "sourceclass.cacheIndex.v1".to_string(),
            entries: BTreeMap::new(),
        };
    };

    serde_json::from_str(&content).unwrap_or_else(|_| CacheIndex {
        schema_version: "sourceclass.cacheIndex.v1".to_string(),
        entries: BTreeMap::new(),
    })
}

pub fn save_cache(cache_dir: &Path, cache: &CacheIndex) -> Result<()> {
    fs::create_dir_all(cache_dir)?;
    fs::write(cache_file(cache_dir), serde_json::to_string_pretty(cache)?)?;
    Ok(())
}
