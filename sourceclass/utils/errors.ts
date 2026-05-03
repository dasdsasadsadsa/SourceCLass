export class SourceClassError extends Error {
  constructor(
    message: string,
    public readonly code = "SOURCECLASS_ERROR",
    public readonly hint?: string
  ) {
    super(message);
    this.name = "SourceClassError";
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
