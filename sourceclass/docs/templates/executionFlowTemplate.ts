import { ReportContext } from "../../core/types.js";
import { list, table } from "../../utils/markdown.js";

export function executionFlowTemplate(context: ReportContext): string {
  const importRows = context.dependencies.imports.slice(0, 80).map((record) => [
    `\`${record.file}\``,
    record.imports.slice(0, 12).map((item) => `\`${item}\``).join(", ")
  ]);

  return `# Execution Flow

This page explains how a new reader should think about the project moving from start point to supporting files.

## Likely Entry Points

${list(context.scan.entryPoints.map((entry) => `\`${entry}\``))}

## Runtime Scripts

${Object.keys(context.dependencies.scripts).length > 0
    ? table(["Script", "Command"], Object.entries(context.dependencies.scripts).map(([name, command]) => [`\`${name}\``, `\`${command}\``]))
    : "No package scripts were detected."}

## Dependency Flow

${importRows.length > 0 ? table(["File", "Imports"], importRows) : "No import relationships were detected in the scanned files."}

## Reading Flow

1. Start with detected entry points.
2. Open nearby configuration files to understand runtime assumptions.
3. Follow imports into API, model, database, and utility files.
4. Read tests after the main flow to see expected behavior.
5. Read build scripts last unless your goal is packaging or deployment.
`;
}
