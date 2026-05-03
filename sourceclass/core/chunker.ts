import { FileChunk, ProjectFile } from "./types.js";
import { estimateTokens } from "./tokenEstimator.js";
import { readTextSafe, redactSecrets } from "../utils/fs.js";

export interface ChunkOptions {
  maxTokens?: number;
  contextLines?: number;
}

export async function chunkFile(file: ProjectFile, options: ChunkOptions = {}): Promise<FileChunk[]> {
  const maxTokens = options.maxTokens ?? 2800;
  const content = redactSecrets(await readTextSafe(file.absolutePath));
  const lines = content.split(/\r?\n/);
  const chunks: Omit<FileChunk, "totalChunks">[] = [];
  let start = 0;

  while (start < lines.length) {
    let end = start;
    let current = "";

    while (end < lines.length) {
      const next = current ? `${current}\n${lines[end]}` : lines[end] ?? "";
      if (estimateTokens(next) > maxTokens && end > start) {
        break;
      }
      current = next;
      end += 1;
    }

    const safeEnd = findBoundary(lines, start, end);
    const finalEnd = safeEnd > start ? safeEnd : end;
    const chunkContent = lines.slice(start, finalEnd).join("\n");

    chunks.push({
      filePath: file.path,
      chunkIndex: chunks.length,
      startLine: start + 1,
      endLine: finalEnd,
      estimatedTokens: estimateTokens(chunkContent),
      content: chunkContent
    });

    start = finalEnd;
  }

  return chunks.map((chunk) => ({
    ...chunk,
    totalChunks: chunks.length
  }));
}

function findBoundary(lines: string[], start: number, proposedEnd: number): number {
  const min = Math.max(start + 1, proposedEnd - 80);
  for (let index = proposedEnd - 1; index >= min; index -= 1) {
    const line = lines[index]?.trim() ?? "";
    if (/^(export\s+)?(async\s+)?function\s+/.test(line) || /^(export\s+)?class\s+/.test(line) || /^def\s+/.test(line)) {
      return index;
    }
  }

  return proposedEnd;
}
