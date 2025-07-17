import type { GitDiffResult } from './types.js';
export declare class GitAnalyzer {
    private cwd;
    constructor(cwd?: string);
    analyzeChanges(includeUnstaged?: boolean): Promise<GitDiffResult>;
    hasChanges(): Promise<boolean>;
    hasStagedChanges(): Promise<boolean>;
    private ensureGitRepository;
    private getStagedDiff;
    private getUnstagedDiff;
    private getStagedFiles;
    private getUnstagedFiles;
    getCurrentBranch(): Promise<string>;
    getLastCommitMessage(): Promise<string | null>;
    getRecentCommits(count?: number): Promise<string[]>;
}
//# sourceMappingURL=GitAnalyzer.d.ts.map