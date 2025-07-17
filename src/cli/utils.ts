import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline';

export async function prompt(question: string): Promise<string> {
  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

export function spinner(message: string): () => void {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let index = 0;

  const interval = setInterval(() => {
    process.stdout.write(`\r${frames[index]} ${message}`);
    index = (index + 1) % frames.length;
  }, 100);

  return () => {
    clearInterval(interval);
    process.stdout.write('\r\n');
  };
}

export function colorText(
  text: string,
  color: 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan'
): string {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
  };

  const reset = '\x1b[0m';
  return `${colors[color]}${text}${reset}`;
}

export function formatError(error: Error): string {
  return colorText(`❌ Error: ${error.message}`, 'red');
}

export function formatSuccess(message: string): string {
  return colorText(`✅ ${message}`, 'green');
}

export function formatWarning(message: string): string {
  return colorText(`⚠️  ${message}`, 'yellow');
}

export function formatInfo(message: string): string {
  return colorText(`ℹ️  ${message}`, 'blue');
}
