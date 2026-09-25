/**
 * Pure diff helpers — no VSCode or process dependencies, so they are trivially unit-testable.
 */

export type FileDiff = { path: string; content: string; added: number; removed: number };

export const bytes = (s: string) => Buffer.byteLength(s);

// files whose full diff adds noise, not signal (lockfiles, builds, snapshots…)
const NOISY =
  /\.(lock|vsix|min\.(js|css)|map|DS_Store|snap)$|^(package-lock\.json|pnpm-lock\.yaml)$/i;

// git flags that keep diff output predictable regardless of user config
export const DIFF_FLAGS = ['--no-color', '--no-ext-diff', '--no-textconv'];

export type GitRunner = (...args: string[]) => Promise<string>;

export function parseFiles(diff: string): FileDiff[] {
  return diff
    .split(/^(?=diff --git )/m)
    .filter(Boolean)
    .map((content) => {
      const header = content.match(/^diff --git (.+)$/m)?.[1] ?? '';
      // git quotes headers when paths contain spaces or non-ASCII; dispatch on the quote
      // rather than falling through, since a quoted path may itself contain " b/"
      const path = header.startsWith('"')
        ? (header.match(/^"[^"]*" "b\/(.+)"$/)?.[1] ?? '(unknown)')
        : (header.match(/ b\/(.+)$/)?.[1] ?? '(unknown)');
      const lines = content.split('\n');
      return {
        path,
        content,
        added: lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).length,
        removed: lines.filter((l) => l.startsWith('-') && !l.startsWith('---')).length,
      };
    });
}

/** Drops ranked files until the diff fits the byte budget, replacing each with a one-line summary. */
export function truncateDiff(
  diff: string,
  maxBytes: number,
  log?: (message: string) => void
): string {
  const summary = ({ path, added, removed }: FileDiff) => `${path}: +${added}/-${removed} lines\n`;
  const files = parseFiles(diff);
  const ranked = [...files].sort((a, b) => {
    const aN = NOISY.test(a.path) ? 1 : 0,
      bN = NOISY.test(b.path) ? 1 : 0;
    return bN - aN || bytes(b.content) - bytes(a.content);
  });
  const kept = new Set(files.map((f) => f.path));
  const omitted: FileDiff[] = [];
  let size = files.reduce((total, f) => total + bytes(f.content), 0);
  for (const f of ranked) {
    if (size <= maxBytes) break;
    kept.delete(f.path);
    omitted.push(f);
    size += bytes(summary(f)) - bytes(f.content);
  }
  log?.(`Truncation: ${kept.size} full diffs, ${omitted.length} summarized`);
  const parts = omitted.map(summary);
  if (parts.length && kept.size) parts.push('\n');
  for (const f of files) if (kept.has(f.path)) parts.push(f.content);
  return parts.join('');
}

/**
 * Staged changes are what will be committed, so they win; unstaged only when nothing is staged.
 * Oversized diffs shrink context first, then drop ranked files to one-line summaries.
 */
export async function getDiff(
  run: GitRunner,
  maxBytes: number,
  log?: (message: string) => void
): Promise<string> {
  const diffAt = (ctx: number) =>
    run('diff', ...DIFF_FLAGS, `-U${ctx}`, '--cached').then(
      (staged) => staged || run('diff', ...DIFF_FLAGS, `-U${ctx}`)
    );

  let diff = '';
  for (const ctx of [3, 2, 1, 0]) {
    diff = await diffAt(ctx);
    if (bytes(diff) <= maxBytes) return diff;
  }
  return truncateDiff(diff, maxBytes, log);
}
