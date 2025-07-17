import type { AIProvider } from './AIProvider.js';
import type { GitAnalyzer } from './GitAnalyzer.js';
import type { PromptManager } from './PromptManager.js';
import type { Config } from './types.js';
export declare class MessageGenerator {
    private aiProvider;
    private gitAnalyzer;
    private promptManager;
    private config;
    constructor(aiProvider: AIProvider, gitAnalyzer: GitAnalyzer, promptManager: PromptManager, config: Config);
    generateCommitMessage(): Promise<string>;
    generateCommitMessageWithContext(): Promise<{
        message: string;
        context: {
            stagedFiles: string[];
            unstagedFiles: string[];
            branch: string;
            hasUnstaged: boolean;
        };
    }>;
    private validatePrerequisites;
    private createPromptContext;
    private cleanupMessage;
    previewPrompt(): Promise<string>;
}
//# sourceMappingURL=MessageGenerator.d.ts.map