import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Commitologist extension is activating...');
  
  // Simple test command
  const testCommand = vscode.commands.registerCommand('commitologist.test', () => {
    vscode.window.showInformationMessage('Commitologist test command works!');
  });
  
  // Register the original commands
  const generateCommand = vscode.commands.registerCommand('commitologist.generateCommitMessage', () => {
    vscode.window.showInformationMessage('Generate command triggered! (Implementation needed)');
  });
  
  const configureCommand = vscode.commands.registerCommand('commitologist.configure', () => {
    vscode.window.showInformationMessage('Configure command triggered! (Implementation needed)');
  });
  
  context.subscriptions.push(testCommand, generateCommand, configureCommand);
  
  console.log('Commitologist extension activated successfully!');
}

export function deactivate() {
  console.log('Commitologist extension deactivated');
}