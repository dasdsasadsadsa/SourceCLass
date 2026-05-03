import { ReportContext } from "../../core/types.js";
import { list } from "../../utils/markdown.js";

export function securityTemplate(context: ReportContext): string {
  const enterpriseNote = context.plan.mode === "enterprise"
    ? "> Enterprise mode note: this is not a replacement for a professional security audit.\n\n"
    : "> Security note: this is a code-reading aid, not a professional security audit.\n\n";

  return `# Security Notes

${enterpriseNote}SourceClass does not execute project code during analysis. It scans files as text and skips secret-like paths by default.

## Security-Sensitive Files To Review

${list(context.plan.securityReviewFiles.map((file) => `\`${file}\``))}

## Checklist

- API keys and tokens must stay in environment variables or secret managers.
- Do not commit \`.env\`, provider secrets, generated caches, or local config containing keys.
- Review authentication and permission code before changing behavior.
- Review dependency versions and lockfiles before release.
- Validate user input at API, CLI, file system, and network boundaries.
- Treat generated documentation as guidance, not proof of safety.
- For private repositories, use a trusted AI provider or a local model endpoint.

## Data Sent To AI Providers

If AI enrichment is enabled, SourceClass may send selected source snippets, file paths, dependency metadata, and generated project maps to the configured provider. Secret-like files are skipped, and common secret patterns are redacted. You should still avoid analyzing sensitive private code with providers you do not trust.
`;
}
