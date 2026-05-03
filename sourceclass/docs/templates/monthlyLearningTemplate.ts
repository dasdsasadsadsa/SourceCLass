import { ReportContext } from "../../core/types.js";
import { table } from "../../utils/markdown.js";

interface DayLesson {
  day: number;
  theme: string;
  focus: string;
  mission: string;
  output: string;
}

export function monthlyLearningTemplate(context: ReportContext): string {
  const lessons = buildMonthlyLessons(context);
  return `# 30-Day Code Class

SourceClass v3 turns one project into a one-month code reading class. The goal is not to rush. The goal is to understand the project structure, flow, modification points, and learning path one day at a time.

## How To Use This Class

- Spend 20 to 60 minutes per day.
- Keep a small notebook with four fields: role, input, output, connection.
- Do not modify risky files until the mission explicitly asks for it.
- If you miss a day, resume from the next unfinished day.
- Day 30 ends with a small direct modification mission.

## 30-Day Curriculum

${table(
    ["Day", "Theme", "Focus", "Mission", "Daily Output"],
    lessons.map((lesson) => [
      `Day ${lesson.day}`,
      lesson.theme,
      lesson.focus,
      lesson.mission,
      lesson.output
    ])
  )}

## Final Rule

By the end of Day 30, you should be able to explain this project without looking at SourceClass: what it is, where it starts, how it flows, what is safe to change, what is dangerous to change, and what you would build next.
`;
}

export function buildMonthlyLessons(context: ReportContext): DayLesson[] {
  const entry = context.scan.entryPoints[0] ?? context.plan.learningPathFiles[0] ?? context.scan.readmeFile ?? "README/config files";
  const configs = context.scan.configFiles.slice(0, 3).join(", ") || "configuration files";
  const tests = context.scan.testFiles.slice(0, 3).join(", ") || "test files";
  const safe = context.roles.find((record) => ["documentation", "test", "utility", "ui"].includes(record.role))?.path ?? "a safe documentation or utility file";
  const risky = context.roles.find((record) => ["security-sensitive", "database", "entry-point", "build-script", "config"].includes(record.role))?.path ?? "a config, entry, database, or security-sensitive file";
  const learning = context.plan.learningPathFiles;

  const picked = (index: number, fallback: string) => learning[index] ?? fallback;

  return [
    lesson(1, "Project Orientation", "Whole structure", "Read README, SUMMARY, and Project Map.", "One-paragraph project summary"),
    lesson(2, "Entry Point", entry, "Open the entry point and write what happens first.", "Startup flow notes"),
    lesson(3, "Folder Map", "Folders", "Explain each top-level folder in one sentence.", "Folder role list"),
    lesson(4, "Config and Packages", configs, "Find package manager, scripts, and key config files.", "Build/config checklist"),
    lesson(5, "Execution Flow", picked(0, entry), "Follow imports or dependency hints from the entry point.", "Flow diagram in text"),
    lesson(6, "Core File 1", picked(1, entry), "Explain purpose, input, output, and dependencies.", "File anatomy note"),
    lesson(7, "Core File 2", picked(2, entry), "Find how this file connects to the rest of the project.", "Connection map"),
    lesson(8, "API or Interface", picked(3, "API/interface files"), "Identify how external input enters the system.", "Input boundary notes"),
    lesson(9, "Service Logic", picked(4, "service or utility files"), "Separate setup code from business logic.", "Logic summary"),
    lesson(10, "Data Shape", picked(5, "model/schema/database files"), "Find models, schemas, or data contracts.", "Data concept list"),
    lesson(11, "Utility Layer", picked(6, "utility/helper files"), "Find reusable helpers and who uses them.", "Utility dependency note"),
    lesson(12, "Tests", tests, "Read one test and explain the protected behavior.", "Test explanation"),
    lesson(13, "Error Paths", picked(7, "error-handling files"), "Search for throw, catch, error, validation, or fallback logic.", "Likely error list"),
    lesson(14, "Environment", ".env.example and config", "Find environment variables without opening secret files.", "Environment variable map"),
    lesson(15, "Security Basics", risky, "Read security-sensitive notes before modifying anything risky.", "Risk checklist"),
    lesson(16, "Build and Run", "Build scripts", "Read scripts and build instructions without executing unknown code.", "Run/build command notes"),
    lesson(17, "Dependency Review", "Manifests and imports", "List important external dependencies.", "Dependency purpose list"),
    lesson(18, "Modification Zones", safe, "Classify safe, caution, and dangerous edit zones.", "Modification compass"),
    lesson(19, "Tiny Safe Change Plan", safe, "Plan a harmless edit but do not make it yet.", "Change plan"),
    lesson(20, "Refactor Reading", picked(8, "shared code"), "Find naming or duplication issues without editing.", "Refactor candidates"),
    lesson(21, "Open Source Comparison", "Similar projects", "Use generated search queries to compare architecture.", "Comparison notes"),
    lesson(22, "Business Direction", "Usefulness", "Explain who would use this project and why.", "User pain point note"),
    lesson(23, "Documentation Improvement", "Docs", "Find one missing setup or explanation detail.", "Documentation patch idea"),
    lesson(24, "Test Improvement", tests, "Design one new test for a safe behavior.", "Test case outline"),
    lesson(25, "Security Review", risky, "Review risks: keys, input, permissions, dependencies, filesystem.", "Security table update"),
    lesson(26, "Packaging Review", configs, "Find how this project could be packaged or released.", "Packaging checklist"),
    lesson(27, "Learning Teachback", picked(9, entry), "Teach one file as if explaining to a beginner.", "Beginner lesson note"),
    lesson(28, "Mini Architecture Doc", "Whole project", "Write architecture in five bullets.", "Five-bullet architecture"),
    lesson(29, "Change Rehearsal", safe, "Prepare exact files and verification steps for a small change.", "Final change checklist"),
    lesson(30, "Direct Modification Mission", safe, "Make one safe change, verify it, and document what changed.", "Completed modification report")
  ];
}

function lesson(day: number, theme: string, focus: string, mission: string, output: string): DayLesson {
  return { day, theme, focus, mission, output };
}
