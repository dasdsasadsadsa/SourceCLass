import { ReportContext } from "../../core/types.js";
import { list } from "../../utils/markdown.js";

export function learningPathTemplate(context: ReportContext): string {
  return `# Learning Path

SourceClass turns this codebase into a study path.

For the SourceClass v3 one-month curriculum, continue to [30-Day Code Class](14-30-day-code-class.md).

## Recommended Reading Order

${context.plan.learningPathFiles.map((file, index) => `${index + 1}. \`${file}\``).join("\n") || "No confident learning path files were detected."}

## Concepts To Study

${list(buildConcepts(context))}

## Exercises

1. Find the entry point and explain in your own words what happens first.
2. Pick one utility file and write down what other files depend on it.
3. Change a harmless label, constant, or config value, then run the test/build command if available.
4. Read one test file and describe what behavior it protects.
5. Create a small diagram of folder responsibilities.

## Mini Quiz

1. Which file starts the program or application?
2. Which folder contains configuration?
3. Which files would you avoid editing until you understand authentication or deployment?
4. Which dependency seems most important to the project?
5. What would you read before making your first change?
`;
}

function buildConcepts(context: ReportContext): string[] {
  const concepts = new Set<string>();
  context.scan.frameworks.forEach((framework) => concepts.add(framework));
  context.scan.packageManagers.forEach((manager) => concepts.add(`${manager} package management`));
  context.roles.forEach((role) => {
    if (role.role === "api") concepts.add("API routing and request handling");
    if (role.role === "database") concepts.add("database schema and persistence");
    if (role.role === "security-sensitive") concepts.add("authentication, authorization, and secret handling");
    if (role.role === "test") concepts.add("automated testing");
    if (role.role === "build-script") concepts.add("build and deployment automation");
  });

  return [...concepts].slice(0, 16);
}
