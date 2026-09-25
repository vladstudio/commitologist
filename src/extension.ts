import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as vscode from 'vscode';
import { getDiff } from './diff';

const execFileAsync = promisify(execFile);
const TETRA_URL = 'http://localhost:24100';
const MAX_DIFF_BYTES = 80 * 1024;
const TETRA_TIMEOUT_MS = 120_000;

let log: vscode.OutputChannel;

const git = (cwd: string, ...args: string[]) =>
  execFileAsync('git', ['-c', 'core.quotepath=false', ...args], {
    cwd,
    maxBuffer: 32 * 1024 * 1024,
  })
    .then((r) => r.stdout)
    .catch((error) => {
      // a diff past the buffer cap would otherwise surface as a cryptic spawn error;
      // say so plainly instead (the context ladder and truncation cannot help below U0)
      if (/maxBuffer/i.test((error as Error).message))
        throw new Error('Diff exceeds 32 MB — commit some changes first');
      throw error;
    });

export function activate(context: vscode.ExtensionContext) {
  log = vscode.window.createOutputChannel('Commitologist');
  context.subscriptions.push(
    log,
    vscode.commands.registerCommand('commitologist.generateMessage', () => generateMessage())
  );
}

export function deactivate() {}

async function generateMessage() {
  const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Commitologist: No workspace folder found');
    return;
  }
  log.appendLine(`Workspace: ${cwd}`);

  try {
    const api = vscode.extensions.getExtension('vscode.git')?.exports?.getAPI(1);
    const repos: { rootUri: vscode.Uri; inputBox: { value: string } }[] = api?.repositories ?? [];
    // prefer the repo of the active editor so multi-root workspaces target the right one
    const active = vscode.window.activeTextEditor?.document.uri;
    const activeFolder = active && vscode.workspace.getWorkspaceFolder(active)?.uri.fsPath;
    const repo =
      repos.find((r) => r.rootUri.fsPath === activeFolder) ??
      repos.find((r) => r.rootUri.fsPath === cwd) ??
      repos[0];
    if (!repo?.inputBox) throw new Error('No Git repository found');
    log.appendLine(`Repo: ${repo.rootUri.fsPath}`);

    const message = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating commit message...',
        cancellable: true,
      },
      (_progress, token) => generate(repo.rootUri.fsPath, token)
    );
    log.appendLine(`Message: ${message}`);

    if (repo.inputBox.value) {
      const overwrite = await vscode.window.showWarningMessage(
        'Commitologist: Overwrite the existing commit message?',
        'Overwrite'
      );
      if (overwrite !== 'Overwrite') return;
    }
    repo.inputBox.value = message;
    log.appendLine('Done');
  } catch (error) {
    await reportError(error);
  }
}

async function generate(cwd: string, token: vscode.CancellationToken): Promise<string> {
  const controller = new AbortController();
  token.onCancellationRequested(() => controller.abort());

  const diff = await getDiff(
    (...args) => git(cwd, ...args),
    MAX_DIFF_BYTES,
    (m) => log.appendLine(m)
  );
  log.appendLine(`Diff: ${Buffer.byteLength(diff)} bytes`);
  if (!diff) throw new Error('No changes found');

  const commandName = vscode.workspace
    .getConfiguration('commitologist')
    .get<string>('commandName', 'Commit message');
  log.appendLine(`Command: ${commandName}`);

  const res = await fetch(`${TETRA_URL}/transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: commandName, text: diff }),
    // user cancellation + hard timeout, so a stalled Tetra can't hang the UI
    signal: AbortSignal.any([controller.signal, AbortSignal.timeout(TETRA_TIMEOUT_MS)]),
  });

  if (!res.ok) {
    const body = await res.text();
    let error = `Tetra returned ${res.status}`;
    try {
      error = JSON.parse(body)?.error ?? error;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(error);
  }

  const { result } = (await res.json()) as { result?: unknown };
  if (typeof result !== 'string') throw new Error('Unexpected response from Tetra');
  return result;
}

async function reportError(error: unknown) {
  const err = error as { name?: string; message?: string };
  if (err?.name === 'AbortError') return; // cancelled by the user
  const offline = /fetch failed|ECONNREFUSED/.test(err?.message ?? '');
  const msg =
    err?.name === 'TimeoutError'
      ? `Tetra timed out after ${TETRA_TIMEOUT_MS / 1000}s`
      : (err?.message ?? 'Unknown error');
  log.appendLine(`Error: ${msg}`);

  const action = await vscode.window.showErrorMessage(
    offline ? 'Commitologist: Cannot connect to Tetra. Is it running?' : `Commitologist: ${msg}`,
    'Retry',
    ...(offline ? (['Get Tetra'] as const) : [])
  );
  if (action === 'Retry') void generateMessage();
  else if (action === 'Get Tetra')
    vscode.env.openExternal(vscode.Uri.parse('https://apps.vlad.studio/tetra'));
}
