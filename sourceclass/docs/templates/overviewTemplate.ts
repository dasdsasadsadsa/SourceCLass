import { ReportContext } from "../../core/types.js";
import { list, section } from "../../utils/markdown.js";

export function overviewTemplate(context: ReportContext): string {
  return `# Introduction

${section("Project Identity", `This project appears to be a ${context.scan.frameworks.join(", ") || "software"} project with ${context.scan.stats.readableFiles} readable files. SourceClass generated this guide to explain what the code is, how it is organized, and how a learner can approach it safely.`)}

${section("Who This Guide Is For", list([
  "Students who downloaded the project and do not know where to start",
  "Beginner developers who want to modify code without breaking the structure",
  "Self-taught programmers who want a reading order and study map",
  "Maintainers who want a generated anatomy document for onboarding"
]))}

${section("What SourceClass Did", list([
  "Scanned the project without executing project code",
  "Ignored common dependency, build, cache, binary, and secret-like paths",
  "Classified files into roles such as entry point, config, API, database, utility, test, and documentation",
  "Created a reading and analysis plan before any AI enrichment",
  "Generated GitBook-style Markdown documentation"
]))}`;
}
