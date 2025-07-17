export type AIProviderType = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama';
export interface Config {
    aiProvider: AIProviderType;
    apiKey?: string;
    model: string;
    promptPreset: string;
    customPrompt?: string;
    ollamaUrl?: string;
    includeUnstagedFiles: boolean;
}
export interface GitDiffResult {
    stagedFiles: string[];
    unstagedFiles: string[];
    stagedDiff: string;
    unstagedDiff: string;
    hasChanges: boolean;
}
export interface AIProviderResponse {
    message: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface AIProviderError {
    code: string;
    message: string;
    details?: unknown;
}
export interface PromptContext {
    diff: string;
    stagedFiles: string[];
    unstagedFiles: string[];
    includeUnstaged: boolean;
}
export declare const DEFAULT_MODELS: Record<AIProviderType, string>;
export declare const PROMPT_PRESETS: {
    readonly conventional: "conventional";
    readonly descriptive: "descriptive";
    readonly concise: "concise";
    readonly custom: "custom";
};
export type PromptPreset = (typeof PROMPT_PRESETS)[keyof typeof PROMPT_PRESETS];
//# sourceMappingURL=types.d.ts.map