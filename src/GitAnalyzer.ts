import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { GitDiffResult } from './types.js';

const execAsync = promisify(exec);

export class GitAnalyzer {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  async analyzeChanges(includeUnstaged = true): Promise<GitDiffResult> {
    await this.ensureGitRepository();

    const [stagedDiff, unstagedDiff, stagedFiles, unstagedFiles] = await Promise.all([
      this.getStagedDiff(),
      includeUnstaged ? this.getUnstagedDiff() : Promise.resolve(''),
      this.getStagedFiles(),
      includeUnstaged ? this.getUnstagedFiles() : Promise.resolve([]),
    ]);

    return {
      stagedFiles,
      unstagedFiles,
      stagedDiff,
      unstagedDiff,
      hasChanges: stagedDiff.length > 0 || unstagedDiff.length > 0,
    };
  }

  async hasChanges(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: this.cwd });
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  async hasStagedChanges(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('git diff --cached --name-only', { cwd: this.cwd });
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  private async ensureGitRepository(): Promise<void> {
    try {
      await execAsync('git rev-parse --git-dir', { cwd: this.cwd });
    } catch {
      throw new Error('Not in a git repository');
    }
  }

  private async getStagedDiff(): Promise<string> {
    try {
      const { stdout } = await execAsync('git diff --cached', { cwd: this.cwd });
      return stdout;
    } catch {
      return '';
    }
  }

  private async getUnstagedDiff(): Promise<string> {
    try {
      const { stdout } = await execAsync('git diff', { cwd: this.cwd });
      return stdout;
    } catch {
      return '';
    }
  }

  private async getStagedFiles(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('git diff --cached --name-only', { cwd: this.cwd });
      return stdout.trim().length > 0 ? stdout.trim().split('\n') : [];
    } catch {
      return [];
    }
  }

  private async getUnstagedFiles(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('git diff --name-only', { cwd: this.cwd });
      return stdout.trim().length > 0 ? stdout.trim().split('\n') : [];
    } catch {
      return [];
    }
  }

  async getCurrentBranch(): Promise<string> {
    try {
      const { stdout } = await execAsync('git branch --show-current', { cwd: this.cwd });
      return stdout.trim();
    } catch {
      return 'main';
    }
  }

  async getLastCommitMessage(): Promise<string | null> {
    try {
      const { stdout } = await execAsync('git log -1 --pretty=format:%s', { cwd: this.cwd });
      return stdout.trim() || null;
    } catch {
      return null;
    }
  }

  async getRecentCommits(count = 5): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`git log -${count} --pretty=format:%s`, { cwd: this.cwd });
      return stdout
        .trim()
        .split('\n')
        .filter((line) => line.length > 0);
    } catch {
      return [];
    }
  }
}
