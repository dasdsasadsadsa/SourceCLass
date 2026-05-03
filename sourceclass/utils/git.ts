import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function getGitVersion(): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync("git", ["--version"]);
    return stdout.trim();
  } catch {
    return undefined;
  }
}

export async function isGitRepository(cwd: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "--is-inside-work-tree"], { cwd });
    return stdout.trim() === "true";
  } catch {
    return false;
  }
}
