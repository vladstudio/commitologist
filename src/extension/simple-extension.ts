import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Commitologist extension is activating...');

  // Simple test command
  const testCommand = vscode.commands.registerCommand('commitologist.test', () => {
    // Show success notification that auto-dismisses after 3 seconds
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: '✅ Commitologist test command works!',
      cancellable: false
    }, async (progress) => {
      progress.report({ increment: 100 });
      await new Promise(resolve => setTimeout(resolve, 3000));
    });
  });

  // Register the original commands
  const generateCommand = vscode.commands.registerCommand(
    'commitologist.generateCommitMessage',
    () => {
      // Show success notification that auto-dismisses after 3 seconds
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: '✅ Generate command triggered! (Implementation needed)',
        cancellable: false
      }, async (progress) => {
        progress.report({ increment: 100 });
        await new Promise(resolve => setTimeout(resolve, 3000));
      });
    }
  );

  const configureCommand = vscode.commands.registerCommand('commitologist.configure', () => {
    // Show success notification that auto-dismisses after 3 seconds
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: '✅ Configure command triggered! (Implementation needed)',
      cancellable: false
    }, async (progress) => {
      progress.report({ increment: 100 });
      await new Promise(resolve => setTimeout(resolve, 3000));
    });
  });

  context.subscriptions.push(testCommand, generateCommand, configureCommand);

  console.log('Commitologist extension activated successfully!');
}

export function deactivate() {
  console.log('Commitologist extension deactivated');
}
