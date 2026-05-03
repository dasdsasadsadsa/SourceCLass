use std::path::PathBuf;

use anyhow::Result;
use clap::{Parser, Subcommand};
use sourceclass_core::output::json_writer::write_project_map;
use sourceclass_core::scanner::walker::{scan_project, ScanConfig};

#[derive(Parser)]
#[command(name = "sourceclass-core")]
#[command(version, about = "SourceClass Rust core scanner")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Scan a source project and write project_map.json.
    Scan {
        /// Project directory to scan.
        path: PathBuf,
        /// Output JSON file path.
        #[arg(long)]
        out: PathBuf,
        /// Cache directory for index.json.
        #[arg(long, default_value = ".sourceclass/cache")]
        cache: PathBuf,
        /// Maximum file size to include.
        #[arg(long, default_value_t = 300)]
        max_file_size_kb: u64,
        /// Additional ignored folder or file names.
        #[arg(long = "ignore")]
        ignore: Vec<String>,
    },
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Scan {
            path,
            out,
            cache,
            max_file_size_kb,
            ignore,
        } => {
            let config = ScanConfig {
                output_path: out.clone(),
                cache_dir: cache,
                max_file_size_kb,
                extra_ignores: ignore,
            };
            let project_map = scan_project(&path, &config)?;
            write_project_map(&out, &project_map)?;
            println!(
                "sourceclass-core: scanned {} included files, ignored {} paths -> {}",
                project_map.stats.included_files,
                project_map.stats.ignored_files,
                out.display()
            );
        }
    }

    Ok(())
}
