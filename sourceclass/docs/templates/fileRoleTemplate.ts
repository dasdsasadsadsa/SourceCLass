import { ReportContext } from "../../core/types.js";
import { table } from "../../utils/markdown.js";

export function fileRoleTemplate(context: ReportContext): string {
  const rows = context.roles
    .sort((a, b) => a.role.localeCompare(b.role) || a.path.localeCompare(b.path))
    .slice(0, 300)
    .map((record) => [
      `\`${record.path}\``,
      record.role,
      record.language,
      `${Math.round(record.confidence * 100)}%`,
      record.reasons.join("; ")
    ]);

  return `# File Roles

SourceClass classifies files before asking AI to explain them. This reduces token waste and gives the reader a map of what matters first.

${table(["File", "Role", "Language", "Confidence", "Reason"], rows)}

## Role Legend

- \`entry-point\`: A likely starting point for execution.
- \`config\`: Tooling, package, framework, or build configuration.
- \`api\`: Routes, controllers, handlers, or server boundary code.
- \`database\`: Persistence, migrations, schemas, or repositories.
- \`model\`: Data models, entities, schemas, or domain objects.
- \`utility\`: Shared helpers or reusable internal code.
- \`test\`: Tests, specs, and verification code.
- \`documentation\`: Markdown or docs files.
- \`build-script\`: Automation and packaging scripts.
- \`security-sensitive\`: Auth, tokens, permissions, crypto, or secrets-adjacent code.
- \`unknown\`: Needs human or AI review.
`;
}
