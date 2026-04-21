import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as vscode from 'vscode';

const execAsync = promisify(exec);
const TETRA_URL = 'http://localhost:24100';
const COMMAND_NAME = 'AI Generate commit message';
const MAX_DIFF_BYTES = 80 * 1024;

let log: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  log = vscode.window.createOutputChannel('Commitologist');
  context.subscriptions.push(
    log,
    vscode.commands.registerCommand('commitologist.generateMessage', () => generateMessage())
  );
}

async function generateMessage() {
  const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!cwd) return vscode.window.showErrorMessage('Commitologist: No workspace folder found');

  log.appendLine(`Workspace: ${cwd}`);

  try {
    const message = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating commit message...',
        cancellable: false,
      },
      async () => {
        const diff = await getDiff(cwd);
        log.appendLine(`Diff: ${diff.length} bytes`);
        if (!diff) throw new Error('No changes found');

        const res = await fetch(`${TETRA_URL}/transform`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: COMMAND_NAME, text: diff }),
        });

        if (!res.ok) {
          const body = await res.text();
          let error = `Tetra returned ${res.status}`;
          try { error = JSON.parse(body)?.error ?? error; } catch { }
          throw new Error(error);
        }

        return ((await res.json()) as { result: string }).result;
      }
    );

    log.appendLine(`Message: ${message}`);

    const git = vscode.extensions.getExtension('vscode.git')?.exports?.getAPI(1);
    const repos: { rootUri: vscode.Uri; inputBox: { value: string } }[] = git?.repositories ?? [];
    log.appendLine(`Repos: ${repos.map((r) => r.rootUri.fsPath).join(', ') || '(none)'}`);

    const repo = repos.find((r) => r.rootUri.fsPath === cwd)
      ?? (repos.length === 1 ? repos[0] : undefined);
    if (!repo?.inputBox) throw new Error('Git source control input not available');
    repo.inputBox.value = message;
    log.appendLine('Done');
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    log.appendLine(`Error: ${msg}`);
    if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED')) {
      const action = await vscode.window.showErrorMessage(
        'Commitologist: Cannot connect to Tetra. Is it running?',
        'Get Tetra'
      );
      if (action === 'Get Tetra') vscode.env.openExternal(vscode.Uri.parse('https://apps.vlad.studio/tetra'));
    } else {
      vscode.window.showErrorMessage(`Commitologist: ${msg}`);
    }
  }
}

const NOISY = /\.(lock|vsix|min\.(js|css)|map|DS_Store|snap)$|^(package-lock\.json|pnpm-lock\.yaml)$/i;

function parseFiles(diff: string) {
  return diff.split(/^(?=diff --git )/m).filter(Boolean).map((content) => {
    const path = content.match(/^diff --git a\/.+ b\/(.+)/)?.[1] ?? '(unknown)';
    const lines = content.split('\n');
    const added = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).length;
    const removed = lines.filter((l) => l.startsWith('-') && !l.startsWith('---')).length;
    return { path, content, added, removed };
  });
}

async function getDiff(cwd: string): Promise<string> {
  const execOpts = { cwd, maxBuffer: 10 * 1024 * 1024 };
  const gitDiff = (ctx: number) =>
    Promise.all([
      execAsync(`git diff --cached -U${ctx}`, execOpts).then((r) => r.stdout),
      execAsync(`git diff -U${ctx}`, execOpts).then((r) => r.stdout),
    ]).then(([staged, unstaged]) => [staged, unstaged].filter(Boolean).join('\n'));

  let diff = '';
  for (const ctx of [3, 2, 1, 0]) {
    diff = await gitDiff(ctx);
    if (diff.length <= MAX_DIFF_BYTES) return diff;
  }

  const summary = (f: { path: string; added: number; removed: number }) =>
    `${f.path}: +${f.added}/-${f.removed} lines\n`;

  const files = parseFiles(diff);
  const omitted: typeof files = [];

  // drop noisy files first, then largest diffs, until within budget
  const ranked = [...files].sort((a, b) => {
    const aN = NOISY.test(a.path) ? 1 : 0, bN = NOISY.test(b.path) ? 1 : 0;
    return bN - aN || b.content.length - a.content.length;
  });
  const kept = new Set(files.map((f) => f.path));
  let size = files.reduce((s, f) => s + f.content.length, 0);
  for (const f of ranked) {
    if (size <= MAX_DIFF_BYTES) break;
    kept.delete(f.path);
    omitted.push(f);
    size += summary(f).length - f.content.length;
  }

  log.appendLine(`Truncation: ${kept.size} full diffs, ${omitted.length} summarized`);
  const parts = omitted.map(summary);
  if (parts.length && kept.size) parts.push('\n');
  for (const f of files) if (kept.has(f.path)) parts.push(f.content);
  return parts.join('');
}

export function deactivate() { }
