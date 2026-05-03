import { AIProvider } from "./provider.js";
import { chunkFile } from "../core/chunker.js";
import { DependencyMap, FileRoleRecord, ProjectScan, SourceClassConfig } from "../core/types.js";
import { baseSystemPrompt } from "../prompts/system/base.js";
import { beginnerPrompt } from "../prompts/system/beginner.js";
import { proPrompt } from "../prompts/system/pro.js";
import { ultimatePrompt } from "../prompts/system/ultimate.js";
import { masterPrompt } from "../prompts/system/master.js";
import { enterprisePrompt } from "../prompts/system/enterprise.js";
import { educationPrompt } from "../prompts/system/education.js";
import { koreanLanguagePrompt } from "../prompts/languages/korean.js";
import { englishLanguagePrompt } from "../prompts/languages/english.js";
import { japaneseLanguagePrompt } from "../prompts/languages/japanese.js";
import { AnalysisPlan } from "../core/types.js";
import { fenced } from "../utils/markdown.js";

export interface PromptRunnerContext {
  scan: ProjectScan;
  roles: FileRoleRecord[];
  dependencies: DependencyMap;
  plan: AnalysisPlan;
  config: SourceClassConfig;
}

export async function runProjectPrompt(
  provider: AIProvider,
  context: PromptRunnerContext
): Promise<string> {
  const prompt = await buildProjectPrompt(context);
  const response = await provider.generate({
    model: context.config.model,
    temperature: 0.2,
    maxTokens: 3200,
    messages: [
      {
        role: "system",
        content: [baseSystemPrompt, modePrompt(context.config.mode), languagePrompt(context.config.language)].join("\n\n")
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return response.text.trim();
}

async function buildProjectPrompt(context: PromptRunnerContext): Promise<string> {
  const deepFiles = context.plan.deepAnalysisFiles
    .map((filePath) => context.scan.files.find((file) => file.path === filePath))
    .filter(Boolean)
    .slice(0, 8);
  const snippets: string[] = [];

  for (const file of deepFiles) {
    if (!file) continue;
    const chunks = await chunkFile(file, { maxTokens: 900 });
    const first = chunks[0];
    if (first) {
      snippets.push(`### ${file.path}\n${fenced(file.language.toLowerCase(), first.content)}`);
    }
  }

  return `Analyze this source code project and return a GitBook-style project-level anatomy explanation.

Required sections:
- Project identity
- Architecture
- Execution flow
- Folder role map
- Core files
- Learning order
- Modification guide
- Build/run guide
- Similar open-source comparison ideas
- Security notes
- Business/product possibility

Project scan:
${fenced("json", JSON.stringify(context.scan, null, 2))}

File roles:
${fenced("json", JSON.stringify(context.roles, null, 2))}

Dependency map:
${fenced("json", JSON.stringify(context.dependencies, null, 2))}

Analysis plan:
${fenced("json", JSON.stringify(context.plan, null, 2))}

Representative source snippets:
${snippets.join("\n\n")}`;
}

function modePrompt(mode: SourceClassConfig["mode"]): string {
  switch (mode) {
    case "normal":
      return beginnerPrompt;
    case "pro":
      return proPrompt;
    case "ultimate":
      return ultimatePrompt;
    case "master":
      return masterPrompt;
    case "enterprise":
      return enterprisePrompt;
    case "education":
      return educationPrompt;
  }
}

function languagePrompt(languages: SourceClassConfig["language"]): string {
  const prompts = languages.map((language) => {
    if (language === "ko") return koreanLanguagePrompt;
    if (language === "ja") return japaneseLanguagePrompt;
    return englishLanguagePrompt;
  });

  return prompts.join("\n\n");
}
