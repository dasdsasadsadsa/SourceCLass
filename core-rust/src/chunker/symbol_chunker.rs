pub fn safe_split_points(language: &str, content: &str) -> Vec<usize> {
    let mut points = vec![1];

    for (index, line) in content.lines().enumerate() {
        let line_number = index + 1;
        let trimmed = line.trim_start();
        let is_boundary = match language {
            "Python" => trimmed.starts_with("def ") || trimmed.starts_with("class "),
            "Rust" => {
                trimmed.starts_with("fn ")
                    || trimmed.starts_with("pub fn ")
                    || trimmed.starts_with("struct ")
                    || trimmed.starts_with("impl ")
            }
            "TypeScript" | "JavaScript" => {
                trimmed.starts_with("export function ")
                    || trimmed.starts_with("function ")
                    || trimmed.starts_with("export class ")
                    || trimmed.starts_with("class ")
                    || trimmed.starts_with("export const ")
            }
            "Java" | "Kotlin" | "C#" | "C++" | "C" => {
                trimmed.starts_with("class ")
                    || trimmed.starts_with("public ")
                    || trimmed.starts_with("private ")
            }
            _ => false,
        };

        if is_boundary && line_number > 1 {
            points.push(line_number);
        }
    }

    let final_line = content.lines().count().max(1);
    if *points.last().unwrap_or(&1) != final_line {
        points.push(final_line + 1);
    }

    points.sort_unstable();
    points.dedup();
    points
}
