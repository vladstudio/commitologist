import { PROMPT_PRESETS, type PromptContext, type PromptPreset } from './types.js';

export class PromptManager {
  private static readonly PROMPT_TEMPLATES: Record<string, string> = {
    [PROMPT_PRESETS.conventional]: `
You are a git commit message generator. Analyze the provided git diff and generate a concise, conventional commit message.

Follow the conventional commit format:
- type(scope): description
- Types: feat, fix, docs, style, refactor, test, chore
- Keep the first line under 50 characters
- Use imperative mood ("add" not "added")
- No period at the end of the first line
- No single or double quotes

Git diff:
{diff}

Generate only the commit message, no additional text or explanations.
`,

    [PROMPT_PRESETS.descriptive]: `
You are a git commit message generator. Analyze the provided git diff and generate a detailed, descriptive commit message.

Requirements:
- First line: Brief summary (under 50 characters)
- Second line: Empty
- Following lines: Detailed description of changes
- Use imperative mood
- Explain what was changed and why
- Be specific about the impact

Git diff:
{diff}

Generate only the commit message, no additional text or explanations.
`,

    [PROMPT_PRESETS.concise]: `
You are a git commit message generator. Analyze the provided git diff and generate a very concise commit message.

Requirements:
- Single line only
- Under 50 characters
- Use imperative mood
- Be specific but brief
- No conventional commit format required

Git diff:
{diff}

Generate only the commit message, no additional text or explanations.
`,
  };

  generatePrompt(context: PromptContext, preset: PromptPreset, customPrompt?: string): string {
    let template: string;

    if (preset === PROMPT_PRESETS.custom) {
      if (!customPrompt) {
        throw new Error('Custom prompt is required when using custom preset');
      }
      template = customPrompt;
    } else {
      const presetTemplate = PromptManager.PROMPT_TEMPLATES[preset];
      if (!presetTemplate) {
        throw new Error(`Unknown prompt preset: ${preset}`);
      }
      template = presetTemplate;
    }

    const combinedDiff = this.combineDiffs(context);
    const fileInfo = this.generateFileInfo(context);

    return template
      .replace('{diff}', combinedDiff)
      .replace('{files}', fileInfo)
      .replace('{stagedFiles}', context.stagedFiles.join(', '))
      .replace('{unstagedFiles}', context.unstagedFiles.join(', '))
      .trim();
  }

  private combineDiffs(context: PromptContext): string {
    const parts: string[] = [];

    if (context.diff) {
      parts.push(context.diff);
    }

    if (context.includeUnstaged && context.unstagedFiles.length > 0) {
      parts.push('\n--- Unstaged changes (will be included if staged) ---');
      // In a real implementation, you'd get the unstaged diff separately
      // For now, we'll just indicate there are unstaged files
      parts.push(`Unstaged files: ${context.unstagedFiles.join(', ')}`);
    }

    return parts.join('\n');
  }

  private generateFileInfo(context: PromptContext): string {
    const info: string[] = [];

    if (context.stagedFiles.length > 0) {
      info.push(`Staged files: ${context.stagedFiles.join(', ')}`);
    }

    if (context.includeUnstaged && context.unstagedFiles.length > 0) {
      info.push(`Unstaged files: ${context.unstagedFiles.join(', ')}`);
    }

    return info.join('\n');
  }

  getAvailablePresets(): PromptPreset[] {
    return Object.values(PROMPT_PRESETS);
  }

  getPresetDescription(preset: PromptPreset): string {
    const descriptions: Record<PromptPreset, string> = {
      [PROMPT_PRESETS.conventional]:
        'Follows conventional commit format (type(scope): description)',
      [PROMPT_PRESETS.descriptive]: 'Detailed commit messages with explanations',
      [PROMPT_PRESETS.concise]: 'Brief, single-line commit messages',
      [PROMPT_PRESETS.custom]: 'Use your own custom prompt template',
    };

    return descriptions[preset] || 'Unknown preset';
  }

  validateCustomPrompt(prompt: string): string[] {
    const errors: string[] = [];

    if (!prompt.trim()) {
      errors.push('Custom prompt cannot be empty');
    }

    if (!prompt.includes('{diff}')) {
      errors.push('Custom prompt must include {diff} placeholder');
    }

    if (prompt.length > 4000) {
      errors.push('Custom prompt is too long (max 4000 characters)');
    }

    return errors;
  }
}
