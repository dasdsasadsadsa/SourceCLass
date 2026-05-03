import path from "node:path";
import { ReportContext } from "../../core/types.js";
import { table } from "../../utils/markdown.js";

export function folderMapTemplate(context: ReportContext): string {
  const folders = new Map<string, { count: number; roles: Set<string>; languages: Set<string> }>();
  const roleByPath = new Map(context.roles.map((record) => [record.path, record]));

  for (const file of context.scan.files) {
    const dir = path.dirname(file.path).replace(/\\/g, "/");
    const key = dir === "." ? "/" : dir;
    const value = folders.get(key) ?? { count: 0, roles: new Set<string>(), languages: new Set<string>() };
    value.count += 1;
    value.roles.add(roleByPath.get(file.path)?.role ?? "unknown");
    value.languages.add(file.language);
    folders.set(key, value);
  }

  const rows = [...folders.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([folder, value]) => [
      folder,
      String(value.count),
      [...value.roles].join(", "),
      [...value.languages].join(", ")
    ]);

  return `# Project Map

This page shows the high-level anatomy of the project before deep reading.

${table(["Folder", "Files", "Detected Roles", "Languages"], rows)}

## Entry Points

${context.scan.entryPoints.length > 0 ? context.scan.entryPoints.map((entry) => `- \`${entry}\``).join("\n") : "- No entry point was confidently detected."}

## Config Files

${context.scan.configFiles.length > 0 ? context.scan.configFiles.map((file) => `- \`${file}\``).join("\n") : "- No common config files were detected."}

## Ignored Paths

${context.scan.ignored.slice(0, 80).map((item) => `- \`${item.path}\`: ${item.reason}`).join("\n") || "- No ignored paths recorded."}
`;
}
