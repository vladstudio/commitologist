import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as vscode from 'vscode';

const execAsync = promisify(exec);
const TETRA_URL = 'http://localhost:24100';
const COMMAND_NAME = 'Commit message';
const MAX_DIFF_BYTES = 300 * 1024;

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
          try { error = JSON.parse(body)?.error ?? error; } catch {}
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

async function getDiff(cwd: string): Promise<string> {
  const execOpts = { cwd, maxBuffer: 10 * 1024 * 1024 };
  const gitDiff = (ctx: number) =>
    Promise.all([
      execAsync(`git diff --cached -U${ctx}`, execOpts).then((r) => r.stdout),
      execAsync(`git diff -U${ctx}`, execOpts).then((r) => r.stdout),
    ]).then(([staged, unstaged]) => [staged, unstaged].filter(Boolean).join('\n'));

  for (const ctx of [3, 2, 1]) {
    const diff = await gitDiff(ctx);
    if (diff.length <= MAX_DIFF_BYTES) {
      if (ctx < 3) log.appendLine(`Using -U${ctx} to fit within size budget`);
      return diff;
    }
  }

  const diff = await gitDiff(1);
  log.appendLine(`Warning: diff (${diff.length} bytes) exceeds ${MAX_DIFF_BYTES} byte budget even with -U1`);
  return diff;
}

export function deactivate() {}
