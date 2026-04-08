import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as vscode from 'vscode';

const execAsync = promisify(exec);
const TETRA_URL = 'http://localhost:24100';
const COMMAND_NAME = 'Commit message';

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

  try {
    const message = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating commit message...',
        cancellable: false,
      },
      async () => {
        const [staged, unstaged] = await Promise.all([
          execAsync('git diff --cached', { cwd }).then((r) => r.stdout),
          execAsync('git diff', { cwd }).then((r) => r.stdout),
        ]);
        const diff = [staged, unstaged].filter(Boolean).join('\n');
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

    const git = vscode.extensions.getExtension('vscode.git')?.exports?.getAPI(1);
    const repo = git?.repositories?.find(
      (r: { rootUri: vscode.Uri }) => r.rootUri.fsPath === cwd
    );
    if (!repo?.inputBox) throw new Error('Git source control input not available');
    repo.inputBox.value = message;
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

export function deactivate() {}
