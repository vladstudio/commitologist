import { type PromptContext, type PromptPreset } from './types.js';
export declare class PromptManager {
    private static readonly PROMPT_TEMPLATES;
    generatePrompt(context: PromptContext, preset: PromptPreset, customPrompt?: string): string;
    private combineDiffs;
    private generateFileInfo;
    getAvailablePresets(): PromptPreset[];
    getPresetDescription(preset: PromptPreset): string;
    validateCustomPrompt(prompt: string): string[];
}
//# sourceMappingURL=PromptManager.d.ts.map