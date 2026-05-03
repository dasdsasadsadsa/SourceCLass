export function gitbookSummaryTemplate(includeBusiness = true): string {
  const lines = [
    "# Summary",
    "",
    "- [Introduction](README.md)",
    "- [Project Map](02-project-map.md)",
    "- [Folder Anatomy](03-folder-anatomy.md)",
    "- [Execution Flow](04-execution-flow.md)",
    "- [File Roles](05-file-roles.md)",
    "- [Beginner Explanation](06-beginner-explanation.md)",
    "- [Modification Guide](07-modification-guide.md)",
    "- [Learning Path](08-learning-path.md)",
    "- [Build and Run](09-build-and-run.md)",
    "- [Open Source Comparison](10-open-source-comparison.md)",
    "- [Security Notes](11-security-notes.md)"
  ];

  if (includeBusiness) {
    lines.push("- [Business Direction](12-business-direction.md)");
  }

  lines.push(
    "- [Mind Map Navigation](13-mind-map-navigation.md)",
    "- [30-Day Code Class](14-30-day-code-class.md)",
    "- [Korean](languages/ko.md)",
    "- [English](languages/en.md)",
    "- [Japanese](languages/ja.md)"
  );

  return `${lines.join("\n")}\n`;
}
