use crate::chunker::token_budget::{estimate_tokens, max_lines_for_budget};
use crate::output::project_map::ChunkPlan;

pub fn line_window_chunks(path: &str, content: &str, max_tokens: usize) -> Vec<ChunkPlan> {
    let lines: Vec<&str> = content.lines().collect();
    let window = max_lines_for_budget(content, max_tokens).max(40);
    let header_lines = count_header_lines(&lines);
    let mut chunks = Vec::new();
    let mut start = 1;

    while start <= lines.len().max(1) {
        let end = (start + window - 1).min(lines.len().max(1));
        let text = lines[(start - 1)..end.min(lines.len())].join("\n");
        chunks.push(ChunkPlan {
            chunk_id: format!("{path}::{}", chunks.len()),
            start_line: start,
            end_line: end,
            estimated_tokens: estimate_tokens(&text).min(max_tokens + 200),
            reason: if chunks.is_empty() {
                "line_window"
            } else {
                "line_window_partial"
            }
            .to_string(),
            includes_header_context: header_lines > 0 && start > 1,
        });
        start = end + 1;
    }

    chunks
}

pub fn chunks_from_split_points(
    path: &str,
    content: &str,
    split_points: &[usize],
    max_tokens: usize,
) -> Vec<ChunkPlan> {
    let lines: Vec<&str> = content.lines().collect();
    let mut chunks = Vec::new();
    let mut start = split_points[0];
    let mut current_end = start;

    for pair in split_points.windows(2) {
        let candidate_end = pair[1].saturating_sub(1).max(pair[0]);
        let text = lines[(start - 1)..candidate_end.min(lines.len())].join("\n");
        if estimate_tokens(&text) > max_tokens && current_end > start {
            push_chunk(
                path,
                &lines,
                &mut chunks,
                start,
                current_end,
                "symbol_boundary",
                max_tokens,
            );
            start = pair[0];
        }
        current_end = candidate_end;
    }

    push_chunk(
        path,
        &lines,
        &mut chunks,
        start,
        current_end.max(start),
        "symbol_boundary",
        max_tokens,
    );
    chunks
}

fn push_chunk(
    path: &str,
    lines: &[&str],
    chunks: &mut Vec<ChunkPlan>,
    start: usize,
    end: usize,
    reason: &str,
    max_tokens: usize,
) {
    if start == 0 || start > lines.len().max(1) {
        return;
    }
    let safe_end = end.min(lines.len().max(1));
    let text = lines[(start - 1)..safe_end.min(lines.len())].join("\n");
    chunks.push(ChunkPlan {
        chunk_id: format!("{path}::{}", chunks.len()),
        start_line: start,
        end_line: safe_end,
        estimated_tokens: estimate_tokens(&text).min(max_tokens + 200),
        reason: reason.to_string(),
        includes_header_context: count_header_lines(lines) > 0 && start > 1,
    });
}

fn count_header_lines(lines: &[&str]) -> usize {
    lines
        .iter()
        .take(80)
        .take_while(|line| {
            let trimmed = line.trim_start();
            trimmed.starts_with("import ")
                || trimmed.starts_with("from ")
                || trimmed.starts_with("use ")
                || trimmed.starts_with("#include")
                || trimmed.starts_with("using ")
                || trimmed.is_empty()
        })
        .count()
}
