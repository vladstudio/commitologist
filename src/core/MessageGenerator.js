"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageGenerator = void 0;
class MessageGenerator {
    constructor(aiProvider, gitAnalyzer, promptManager, config) {
        this.aiProvider = aiProvider;
        this.gitAnalyzer = gitAnalyzer;
        this.promptManager = promptManager;
        this.config = config;
    }
    async generateCommitMessage() {
        await this.validatePrerequisites();
        const gitDiff = await this.gitAnalyzer.analyzeChanges(this.config.includeUnstagedFiles);
        if (!gitDiff.hasChanges) {
            throw new Error('No changes detected in the repository');
        }
        const context = this.createPromptContext(gitDiff);
        const prompt = this.promptManager.generatePrompt(context, this.config.promptPreset, this.config.customPrompt);
        const response = await this.aiProvider.generateCommitMessage(prompt);
        return this.cleanupMessage(response.message);
    }
    async generateCommitMessageWithContext() {
        await this.validatePrerequisites();
        const gitDiff = await this.gitAnalyzer.analyzeChanges(this.config.includeUnstagedFiles);
        if (!gitDiff.hasChanges) {
            throw new Error('No changes detected in the repository');
        }
        const context = this.createPromptContext(gitDiff);
        const prompt = this.promptManager.generatePrompt(context, this.config.promptPreset, this.config.customPrompt);
        const response = await this.aiProvider.generateCommitMessage(prompt);
        const branch = await this.gitAnalyzer.getCurrentBranch();
        return {
            message: this.cleanupMessage(response.message),
            context: {
                stagedFiles: gitDiff.stagedFiles,
                unstagedFiles: gitDiff.unstagedFiles,
                branch,
                hasUnstaged: gitDiff.unstagedFiles.length > 0,
            },
        };
    }
    async validatePrerequisites() {
        if (!(await this.gitAnalyzer.hasChanges())) {
            throw new Error('No changes detected in the repository');
        }
        if (!(await this.gitAnalyzer.hasStagedChanges()) && !this.config.includeUnstagedFiles) {
            throw new Error('No staged changes found. Stage your changes or enable including unstaged files.');
        }
        try {
            await this.aiProvider.validateConfig();
        }
        catch (error) {
            throw new Error(`AI provider configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    createPromptContext(gitDiff) {
        let combinedDiff = gitDiff.stagedDiff;
        if (this.config.includeUnstagedFiles && gitDiff.unstagedDiff) {
            combinedDiff = [gitDiff.stagedDiff, gitDiff.unstagedDiff]
                .filter((diff) => diff.length > 0)
                .join('\n\n--- Unstaged changes ---\n\n');
        }
        return {
            diff: combinedDiff,
            stagedFiles: gitDiff.stagedFiles,
            unstagedFiles: gitDiff.unstagedFiles,
            includeUnstaged: this.config.includeUnstagedFiles,
        };
    }
    cleanupMessage(message) {
        return message
            .trim()
            .replace(/^["']|["']$/g, '')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
    }
    async previewPrompt() {
        const gitDiff = await this.gitAnalyzer.analyzeChanges(this.config.includeUnstagedFiles);
        if (!gitDiff.hasChanges) {
            throw new Error('No changes detected in the repository');
        }
        const context = this.createPromptContext(gitDiff);
        return this.promptManager.generatePrompt(context, this.config.promptPreset, this.config.customPrompt);
    }
}
exports.MessageGenerator = MessageGenerator;
//# sourceMappingURL=MessageGenerator.js.map