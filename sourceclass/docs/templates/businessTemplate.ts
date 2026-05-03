import { ReportContext } from "../../core/types.js";

export function businessTemplate(context: ReportContext): string {
  const stack = context.scan.frameworks.join(", ") || Object.keys(context.scan.languages).join(", ") || "software";

  return `# Business Direction

This page turns code understanding into practical product thinking. It is especially useful in Master and Enterprise modes.

## Who Might Use This Project?

- Developers or learners interested in a ${stack} project.
- Teams that need to onboard contributors.
- Educators who want a real codebase for lessons.
- Builders who want to adapt the project into a useful tool.

## Pain Point

The likely pain point is not only writing code. It is understanding structure, responsibilities, flow, safe modification points, and release risks.

## Smallest Useful Next Feature

Pick a change that touches one entry point, one supporting module, and one test. Avoid changes that require a full architecture rewrite at the beginning.

## Monetization Possibilities

- Keep the core project free and open-source.
- Use sponsorships, consulting, workshops, or custom deployments.
- Avoid paywalling learning-critical documentation or basic CLI usage.

## Failure Risks

- Users may not understand where to start.
- Build and runtime instructions may be incomplete.
- Security-sensitive code may be changed without enough review.
- The project may be too coupled for easy modification.

## What To Build Next

1. Improve tests around the core behavior.
2. Add a small feature with clear user value.
3. Document setup and failure cases.
4. Reduce configuration friction.
5. Add examples for beginner contributors.
`;
}
