use std::fs;
use std::path::Path;

use anyhow::{Context, Result};

use super::project_map::ProjectMap;

pub fn write_project_map(path: &Path, project_map: &ProjectMap) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .with_context(|| format!("create output directory {}", parent.display()))?;
    }

    let json = serde_json::to_string_pretty(project_map)?;
    fs::write(path, json).with_context(|| format!("write project map {}", path.display()))?;
    Ok(())
}
