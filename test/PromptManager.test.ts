
import { describe, it, expect } from 'vitest';
import { PromptManager } from '../src/PromptManager';
import { PROMPT_PRESETS } from '../src/types';

describe('PromptManager', () => {
  const promptManager = new PromptManager();
  const context = {
    diff: 'diff --git a/file.txt b/file.txt\nindex e69de29..9daeafb 100644\n--- a/file.txt\n+++ b/file.txt\n@@ -0,0 +1 @@\n+Hello World',
    stagedFiles: ['file.txt'],
    unstagedFiles: [],
    includeUnstaged: false,
  };

  it('should generate a conventional commit prompt', () => {
    const prompt = promptManager.generatePrompt(context, PROMPT_PRESETS.conventional);
    expect(prompt).toContain('conventional commit message');
    expect(prompt).toContain(context.diff);
  });

  it('should generate a descriptive commit prompt', () => {
    const prompt = promptManager.generatePrompt(context, PROMPT_PRESETS.descriptive);
    expect(prompt).toContain('descriptive commit message');
    expect(prompt).toContain(context.diff);
  });

  it('should generate a concise commit prompt', () => {
    const prompt = promptManager.generatePrompt(context, PROMPT_PRESETS.concise);
    expect(prompt).toContain('concise commit message');
    expect(prompt).toContain(context.diff);
  });

  it('should generate a custom commit prompt', () => {
    const customPrompt = 'My custom prompt with {diff}';
    const prompt = promptManager.generatePrompt(context, PROMPT_PRESETS.custom, customPrompt);
    expect(prompt).toBe('My custom prompt with ' + context.diff);
  });

  it('should throw an error for custom preset without custom prompt', () => {
    expect(() => promptManager.generatePrompt(context, PROMPT_PRESETS.custom)).toThrow(
      'Custom prompt is required when using custom preset'
    );
  });

  it('should throw an error for unknown preset', () => {
    expect(() => promptManager.generatePrompt(context, 'unknown' as any)).toThrow(
      'Unknown prompt preset: unknown'
    );
  });
});
