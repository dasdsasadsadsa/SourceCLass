pub fn estimate_tokens(content: &str) -> usize {
    (content.chars().count() / 4).max(1)
}

pub fn max_lines_for_budget(content: &str, max_tokens: usize) -> usize {
    let total_lines = content.lines().count().max(1);
    let total_tokens = estimate_tokens(content).max(1);
    ((total_lines * max_tokens) / total_tokens).max(40)
}
