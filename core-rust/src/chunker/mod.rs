pub mod line_chunker;
pub mod symbol_chunker;
pub mod token_budget;

use crate::output::project_map::ChunkPlan;

pub fn plan_chunks(path: &str, language: &str, content: &str, max_tokens: usize) -> Vec<ChunkPlan> {
    let estimated = token_budget::estimate_tokens(content);
    let line_count = content.lines().count().max(1);

    if estimated <= max_tokens {
        return vec![ChunkPlan {
            chunk_id: format!("{path}::0"),
            start_line: 1,
            end_line: line_count,
            estimated_tokens: estimated,
            reason: "small_file".to_string(),
            includes_header_context: false,
        }];
    }

    let split_points = symbol_chunker::safe_split_points(language, content);
    if split_points.len() >= 2 {
        return line_chunker::chunks_from_split_points(path, content, &split_points, max_tokens);
    }

    line_chunker::line_window_chunks(path, content, max_tokens)
}
