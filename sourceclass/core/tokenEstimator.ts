export function estimateTokens(content: string): number {
  if (!content) {
    return 0;
  }

  return Math.ceil(content.length / 4);
}

export function estimateFileTokens(sizeKB: number): number {
  return Math.ceil((sizeKB * 1024) / 4);
}
