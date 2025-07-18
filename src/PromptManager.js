Object.defineProperty(exports, '__esModule', { value: true });
exports.PromptManager = void 0;
const types_js_1 = require('./types.js');
class PromptManager {
  generatePrompt(context, preset, customPrompt) {
    let template;
    if (preset === types_js_1.PROMPT_PRESETS.custom) {
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
  combineDiffs(context) {
    const parts = [];
    if (context.diff) {
      parts.push(context.diff);
    }
    if (context.includeUnstaged && context.unstagedFiles.length > 0) {
      parts.push('\n--- Unstaged changes (will be included if staged) ---');
      parts.push(`Unstaged files: ${context.unstagedFiles.join(', ')}`);
    }
    return parts.join('\n');
  }
  generateFileInfo(context) {
    const info = [];
    if (context.stagedFiles.length > 0) {
      info.push(`Staged files: ${context.stagedFiles.join(', ')}`);
    }
    if (context.includeUnstaged && context.unstagedFiles.length > 0) {
      info.push(`Unstaged files: ${context.unstagedFiles.join(', ')}`);
    }
    return info.join('\n');
  }
  getAvailablePresets() {
    return Object.values(types_js_1.PROMPT_PRESETS);
  }
  getPresetDescription(preset) {
    const descriptions = {
      [types_js_1.PROMPT_PRESETS.conventional]:
        'Follows conventional commit format (type(scope): description)',
      [types_js_1.PROMPT_PRESETS.descriptive]: 'Detailed commit messages with explanations',
      [types_js_1.PROMPT_PRESETS.concise]: 'Brief, single-line commit messages',
      [types_js_1.PROMPT_PRESETS.custom]: 'Use your own custom prompt template',
    };
    return descriptions[preset] || 'Unknown preset';
  }
  validateCustomPrompt(prompt) {
    const errors = [];
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
exports.PromptManager = PromptManager;
PromptManager.PROMPT_TEMPLATES = {
  [types_js_1.PROMPT_PRESETS.conventional]: `
You are a git commit message generator. Analyze the provided git diff and generate a concise, conventional commit message.

Follow the conventional commit format:
- type(scope): description
- Types: feat, fix, docs, style, refactor, test, chore
- Keep the first line under 50 characters
- Use imperative mood ("add" not "added")
- No period at the end of the first line

Git diff:
{diff}

Generate only the commit message, no additional text or explanations.
`,
  [types_js_1.PROMPT_PRESETS.descriptive]: `
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
  [types_js_1.PROMPT_PRESETS.concise]: `
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
//# sourceMappingURL=PromptManager.js.map
