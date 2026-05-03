use std::time::{SystemTime, UNIX_EPOCH};

pub fn modified_unix(modified: SystemTime) -> u64 {
    modified
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or_default()
}
