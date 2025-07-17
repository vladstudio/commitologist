Object.defineProperty(exports, '__esModule', { value: true });
exports.GitAnalyzer = void 0;
const node_child_process_1 = require('node:child_process');
const node_util_1 = require('node:util');
const execAsync = (0, node_util_1.promisify)(node_child_process_1.exec);
class GitAnalyzer {
  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
  }
  async analyzeChanges(includeUnstaged = true) {
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
  async hasChanges() {
    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: this.cwd });
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }
  async hasStagedChanges() {
    try {
      const { stdout } = await execAsync('git diff --cached --name-only', { cwd: this.cwd });
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }
  async ensureGitRepository() {
    try {
      await execAsync('git rev-parse --git-dir', { cwd: this.cwd });
    } catch {
      throw new Error('Not in a git repository');
    }
  }
  async getStagedDiff() {
    try {
      const { stdout } = await execAsync('git diff --cached', { cwd: this.cwd });
      return stdout;
    } catch {
      return '';
    }
  }
  async getUnstagedDiff() {
    try {
      const { stdout } = await execAsync('git diff', { cwd: this.cwd });
      return stdout;
    } catch {
      return '';
    }
  }
  async getStagedFiles() {
    try {
      const { stdout } = await execAsync('git diff --cached --name-only', { cwd: this.cwd });
      return stdout.trim().length > 0 ? stdout.trim().split('\n') : [];
    } catch {
      return [];
    }
  }
  async getUnstagedFiles() {
    try {
      const { stdout } = await execAsync('git diff --name-only', { cwd: this.cwd });
      return stdout.trim().length > 0 ? stdout.trim().split('\n') : [];
    } catch {
      return [];
    }
  }
  async getCurrentBranch() {
    try {
      const { stdout } = await execAsync('git branch --show-current', { cwd: this.cwd });
      return stdout.trim();
    } catch {
      return 'main';
    }
  }
  async getLastCommitMessage() {
    try {
      const { stdout } = await execAsync('git log -1 --pretty=format:%s', { cwd: this.cwd });
      return stdout.trim() || null;
    } catch {
      return null;
    }
  }
  async getRecentCommits(count = 5) {
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
exports.GitAnalyzer = GitAnalyzer;
//# sourceMappingURL=GitAnalyzer.js.map
