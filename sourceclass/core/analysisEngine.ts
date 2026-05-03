import { createProvider } from "../ai/providerFactory.js";
import { runProjectPrompt } from "../ai/promptRunner.js";
import { createAnalysisPlan } from "./analysisPlanner.js";
import { classifyFiles } from "./fileClassifier.js";
import { mapDependencies } from "./dependencyMapper.js";
import { scanProject } from "./projectScanner.js";
import { ReportContext, SourceClassConfig } from "./types.js";
import { resolveApiKey } from "../utils/config.js";
import { writeGitBookOutput, OutputResult } from "./outputWriter.js";

export interface CreateContextOptions {
  ai?: boolean;
  cwd?: string;
}

export interface CreateContextResult {
  context: ReportContext;
  aiUsed: boolean;
  warnings: string[];
}

export async function createReportContext(
  projectPath: string,
  config: SourceClassConfig,
  options: CreateContextOptions = {}
): Promise<CreateContextResult> {
  const warnings: string[] = [];
  const scan = await scanProject(projectPath, config);
  const roles = classifyFiles(scan);
  const dependencies = await mapDependencies(scan);
  const plan = createAnalysisPlan(scan, roles, config);
  let aiProjectAnalysis: string | undefined;
  let aiUsed = false;

  if (options.ai !== false) {
    const apiKey = await resolveApiKey(config.provider, config, options.cwd);

    if (!apiKey && config.provider !== "local") {
      warnings.push(
        `SourceClass could not find an API key for ${config.provider}. Set the provider environment variable or run sourceclass config. Local metadata docs were still generated.`
      );
    } else {
      try {
        const provider = createProvider({ config, apiKey });
        aiProjectAnalysis = await runProjectPrompt(provider, { scan, roles, dependencies, plan, config });
        aiUsed = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        warnings.push(`AI provider enrichment failed: ${message}. Local metadata docs were still generated.`);
      }
    }
  }

  return {
    context: {
      scan,
      roles,
      dependencies,
      plan,
      config,
      aiProjectAnalysis
    },
    aiUsed,
    warnings
  };
}

export async function analyzeAndWrite(
  projectPath: string,
  config: SourceClassConfig,
  options: CreateContextOptions = {}
): Promise<CreateContextResult & { output: OutputResult }> {
  const result = await createReportContext(projectPath, config, options);
  const output = await writeGitBookOutput(result.context);

  return {
    ...result,
    output: {
      ...output,
      warnings: [...output.warnings, ...result.warnings]
    }
  };
}
