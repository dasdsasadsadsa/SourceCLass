import path from "node:path";
import { ReportContext } from "../../core/types.js";
import { table } from "../../utils/markdown.js";

export function mindMapTemplate(context: ReportContext): string {
  const roleByPath = new Map(context.roles.map((record) => [record.path, record]));
  const folders = new Map<string, string[]>();

  for (const file of context.scan.files) {
    const folder = path.dirname(file.path).replace(/\\/g, "/");
    const key = folder === "." ? "/" : folder;
    const items = folders.get(key) ?? [];
    items.push(file.path);
    folders.set(key, items);
  }

  const rows = [...folders.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([folder, files]) => {
      const representative = files.slice(0, 6).map((file) => {
        const role = roleByPath.get(file)?.role ?? "unknown";
        return `\`${file}\` (${role})`;
      });
      return [
        folder,
        String(files.length),
        representative.join(", "),
        explorationTarget(folder, files, roleByPath)
      ];
    });

  return `# Mind Map Navigation

SourceClass v3 turns documentation into an explorable code map. Use this page as the central navigation hub when you want to move from folder to file to role to modification point.

## Navigation Buttons

[Project Map](02-project-map.md) | [Execution Flow](04-execution-flow.md) | [File Roles](05-file-roles.md) | [Modification Guide](07-modification-guide.md) | [30-Day Class](14-30-day-code-class.md)

## Explorer Routes

### Start Route

1. Open [Project Map](02-project-map.md).
2. Jump to the entry point listed below.
3. Follow dependency hints in [Execution Flow](04-execution-flow.md).
4. Return here when you lose the structure.

### Modify Route

1. Find the folder or file below.
2. Check the role and risk level.
3. Read [Modification Guide](07-modification-guide.md).
4. Make one small change and verify with build or tests.

### Learning Route

1. Read today's mission in [30-Day Code Class](14-30-day-code-class.md).
2. Open the linked file from this map.
3. Write down purpose, input, output, and connection.
4. Move to the next day only after you can explain the current file.

## Entry Point Jump

${context.scan.entryPoints.length > 0 ? context.scan.entryPoints.map((entry) => `- \`${entry}\` -> [Execution Flow](04-execution-flow.md)`).join("\n") : "- No entry point was confidently detected. Start with README and configuration files."}

## Folder To File Map

${table(["Folder", "Files", "Representative Files", "Best Next Page"], rows)}

## Modification Compass

${table(
    ["Zone", "Meaning", "Start Here"],
    [
      ["Safe", "Documentation, tests, simple utility/UI files", "[Modification Guide](07-modification-guide.md#safe-modification-map)"],
      ["Caution", "Entry points, config, build scripts, database code", "[Modification Guide](07-modification-guide.md#dangerous-modification-map)"],
      ["Security", "Auth, tokens, permissions, secrets-adjacent files", "[Security Notes](11-security-notes.md)"],
      ["Learning", "Files selected for study order", "[Learning Path](08-learning-path.md)"]
    ]
  )}
`;
}

function explorationTarget(folder: string, files: string[], roleByPath: Map<string, { role: string }>): string {
  const roles = new Set(files.map((file) => roleByPath.get(file)?.role ?? "unknown"));
  if (roles.has("entry-point")) return "[Execution Flow](04-execution-flow.md)";
  if (roles.has("security-sensitive")) return "[Security Notes](11-security-notes.md)";
  if (roles.has("config") || roles.has("build-script")) return "[Build and Run](09-build-and-run.md)";
  if (roles.has("test")) return "[Learning Path](08-learning-path.md)";
  if (folder === "/") return "[Project Map](02-project-map.md)";
  return "[File Roles](05-file-roles.md)";
}
