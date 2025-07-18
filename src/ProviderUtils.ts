import type { AIProviderError } from './types.js';

export function createProviderError(code: string | number, message: string): AIProviderError {
  const errorCode = typeof code === 'number' ? getErrorCodeFromStatus(code) : code;
  return {
    code: errorCode,
    message,
  };
}

export function getErrorCodeFromStatus(status: number): string {
  switch (status) {
    case 401:
      return 'INVALID_API_KEY';
    case 403:
      return 'INSUFFICIENT_PERMISSIONS';
    case 404:
      return 'MODEL_NOT_FOUND';
    case 429:
      return 'RATE_LIMIT_EXCEEDED';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'API_ERROR';
  }
}

export async function parseJsonErrorResponse(response: Response): Promise<string> {
  try {
    const errorText = await response.text();
    const errorData = JSON.parse(errorText);
    if (errorData.error?.message) {
      return errorData.error.message;
    }
    if (errorData.error) {
      return errorData.error;
    }
    return `API error: ${response.status} ${response.statusText}`;
  } catch {
    return `API error: ${response.status} ${response.statusText}`;
  }
}

export function getSystemPrompt(): string {
  return 'You are an expert at writing clear, concise commit messages. Generate a commit message based on the provided git diff.';
}
