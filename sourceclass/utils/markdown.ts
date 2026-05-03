export function heading(level: number, text: string): string {
  return `${"#".repeat(level)} ${text}`;
}

export function list(items: string[]): string {
  if (items.length === 0) {
    return "- None detected";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

export function table(headers: string[], rows: string[][]): string {
  const clean = (value: string) => value.replace(/\|/g, "\\|").replace(/\n/g, " ");
  const head = `| ${headers.map(clean).join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map(clean).join(" | ")} |`);
  return [head, divider, ...body].join("\n");
}

export function fenced(language: string, content: string): string {
  return `\`\`\`${language}\n${content.replace(/```/g, "'''")}\n\`\`\``;
}

export function section(title: string, body: string): string {
  return `${heading(2, title)}\n\n${body.trim()}\n`;
}

export function relativeMarkdownLink(label: string, href: string): string {
  return `[${label}](${href.replace(/\\/g, "/")})`;
}

export function truncateMarkdown(value: string, max = 8000): string {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max)}\n\n> Output truncated by SourceClass for readability.`;
}
