use std::fs::File;
use std::io::Read;
use std::path::Path;

use anyhow::{Context, Result};

const SAMPLE_SIZE: usize = 8192;

pub fn is_binary(path: &Path) -> Result<bool> {
    let mut file = File::open(path).with_context(|| format!("open {}", path.display()))?;
    let mut buffer = vec![0_u8; SAMPLE_SIZE];
    let bytes_read = file.read(&mut buffer)?;
    let sample = &buffer[..bytes_read];

    if sample.contains(&0) {
        return Ok(true);
    }

    if sample.is_empty() {
        return Ok(false);
    }

    let invalid_count = sample
        .iter()
        .filter(|byte| {
            let value = **byte;
            value < 0x09 || (value > 0x0D && value < 0x20)
        })
        .count();

    let control_ratio = invalid_count as f64 / sample.len() as f64;
    Ok(control_ratio > 0.08 || std::str::from_utf8(sample).is_err() && control_ratio > 0.02)
}
