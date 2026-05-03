use std::path::Path;

pub fn extension_for(path: &Path) -> String {
    path.extension()
        .and_then(|value| value.to_str())
        .map(|value| format!(".{}", value.to_ascii_lowercase()))
        .unwrap_or_default()
}

pub fn classify_role_hints(relative_path: &str, language: &str) -> Vec<String> {
    let normalized = relative_path.replace('\\', "/");
    let lower = normalized.to_ascii_lowercase();
    let basename = lower.rsplit('/').next().unwrap_or(&lower);
    let mut hints = Vec::new();

    push_if(
        &mut hints,
        basename == "package.json",
        "dependency_manifest",
    );
    push_if(&mut hints, basename == "cargo.toml", "dependency_manifest");
    push_if(
        &mut hints,
        basename == "requirements.txt",
        "dependency_manifest",
    );
    push_if(
        &mut hints,
        basename == "pyproject.toml",
        "dependency_manifest",
    );
    push_if(&mut hints, basename == "go.mod", "dependency_manifest");
    push_if(&mut hints, basename == "pom.xml", "dependency_manifest");
    push_if(
        &mut hints,
        basename.ends_with(".lock")
            || basename == "package-lock.json"
            || basename == "pnpm-lock.yaml"
            || basename == "yarn.lock",
        "lockfile",
    );
    push_if(
        &mut hints,
        basename == "dockerfile"
            || basename.starts_with("docker-compose")
            || basename == "makefile",
        "build_script",
    );
    push_if(
        &mut hints,
        basename == ".env.example" || basename.ends_with(".env.example"),
        "environment",
    );
    push_if(
        &mut hints,
        lower.contains("/generated/") || lower.ends_with(".g.dart") || lower.ends_with(".pb.go"),
        "generated",
    );
    push_if(
        &mut hints,
        lower.ends_with("src/main.rs")
            || lower.ends_with("main.py")
            || lower.ends_with("src/index.js")
            || lower.ends_with("src/index.ts"),
        "entry_point",
    );
    push_if(
        &mut hints,
        basename == "index.ts"
            || basename == "index.js"
            || basename == "main.ts"
            || basename == "main.js",
        "possible_entry_point",
    );
    push_if(
        &mut hints,
        lower.contains("/cli/") || basename.starts_with("cli."),
        "cli",
    );
    push_if(
        &mut hints,
        lower.contains("/api/") || lower.contains("/controllers/") || lower.contains("/handlers/"),
        "api",
    );
    push_if(
        &mut hints,
        lower.contains("/routes/") || lower.contains("/router/"),
        "route",
    );
    push_if(
        &mut hints,
        lower.contains("/components/") || lower.ends_with(".tsx") || lower.ends_with(".jsx"),
        "component",
    );
    push_if(
        &mut hints,
        lower.contains("/pages/") || lower.contains("/screens/"),
        "page",
    );
    push_if(
        &mut hints,
        lower.contains("/services/") || lower.contains("/service/"),
        "service",
    );
    push_if(
        &mut hints,
        lower.contains("/models/") || lower.contains("/entities/") || lower.contains("/schemas/"),
        "model",
    );
    push_if(
        &mut hints,
        lower.contains("/database/")
            || lower.contains("/db/")
            || lower.contains("/migrations/")
            || lower.contains("/prisma/"),
        "database",
    );
    push_if(
        &mut hints,
        lower.contains("/utils/") || lower.contains("/helpers/") || lower.contains("/lib/"),
        "utility",
    );
    push_if(
        &mut hints,
        lower.contains("/test/")
            || lower.contains("/tests/")
            || lower.contains("/__tests__/")
            || lower.contains(".test.")
            || lower.contains(".spec."),
        "test",
    );
    push_if(&mut hints, language == "Markdown", "documentation");
    push_if(
        &mut hints,
        lower.contains("auth")
            || lower.contains("token")
            || lower.contains("secret")
            || lower.contains("password")
            || lower.contains("permission")
            || lower.contains("crypto"),
        "security_sensitive",
    );
    push_if(
        &mut hints,
        lower.contains("config")
            || basename.ends_with(".config.ts")
            || basename.ends_with(".config.js"),
        "config",
    );

    if hints.is_empty() {
        hints.push("unknown".to_string());
    }

    hints.sort();
    hints.dedup();
    hints
}

fn push_if(values: &mut Vec<String>, condition: bool, value: &str) {
    if condition {
        values.push(value.to_string());
    }
}
