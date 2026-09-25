import { describe, expect, test } from 'bun:test';
import { bytes, getDiff, parseFiles, truncateDiff } from './diff';

const diffFor = (path: string, lines: number) =>
  [
    `diff --git a/${path} b/${path}`,
    `--- a/${path}`,
    `+++ b/${path}`,
    ...Array<string>(lines).fill('+line'),
    '',
  ].join('\n');

describe('parseFiles', () => {
  test('counts additions and removals, ignoring +++/--- headers', () => {
    const [file] = parseFiles('diff --git a/x.ts b/x.ts\n--- a/x.ts\n+++ b/x.ts\n+one\n-two\n');
    expect(file.path).toBe('x.ts');
    expect(file.added).toBe(1);
    expect(file.removed).toBe(1);
  });

  test('parses paths containing spaces (quoted by git)', () => {
    const [file] = parseFiles('diff --git "a/my file" "b/my file"\n+one\n');
    expect(file.path).toBe('my file');
  });

  test('quoted paths with " b/" inside the name take the quoted branch', () => {
    const [file] = parseFiles('diff --git "a/a b/c.ts" "b/a b/c.ts"\n+one\n');
    expect(file.path).toBe('a b/c.ts');
  });
});

describe('truncateDiff', () => {
  test('keeps small diffs untouched', () => {
    const diff = diffFor('a.ts', 3);
    expect(truncateDiff(diff, 1000)).toBe(diff);
  });

  test('drops noisy files first, then the largest, until within budget', () => {
    const diff = [diffFor('bun.lock', 50), diffFor('big.ts', 40), diffFor('small.ts', 1)].join(
      '\n'
    );
    const out = truncateDiff(diff, 200);
    expect(out).toContain('bun.lock: +50/-0 lines');
    expect(out).toContain('big.ts: +40/-0 lines');
    expect(out).toContain('diff --git a/small.ts b/small.ts');
    expect(bytes(out)).toBeLessThanOrEqual(200);
  });
});

describe('getDiff', () => {
  const fakeGit = (staged: string, unstaged: string) => {
    const calls: string[][] = [];
    const run = (...args: string[]) => {
      calls.push(args);
      return Promise.resolve(args.includes('--cached') ? staged : unstaged);
    };
    return { run, calls };
  };

  test('uses the staged diff when present', async () => {
    const { run, calls } = fakeGit(
      'diff --git a/x b/x\n+staged\n',
      'diff --git a/y b/y\n+unstaged\n'
    );
    const out = await getDiff(run, 1000);
    expect(out).toContain('+staged');
    expect(calls[0]).toContain('--cached');
  });

  test('falls back to unstaged when nothing is staged', async () => {
    const { run } = fakeGit('', 'diff --git a/y b/y\n+unstaged\n');
    expect(await getDiff(run, 1000)).toContain('+unstaged');
  });

  test('shrinks context before truncating', async () => {
    const huge = `diff --git a/big b/big\n${'x'.repeat(200)}\n`;
    const { run, calls } = fakeGit(huge, huge); // oversized at every context level
    const out = await getDiff(run, 60);
    expect(calls.at(-1)).toContain('-U0');
    expect(out).toContain('big:'); // reduced to a summary
  });
});
