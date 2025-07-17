"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProvider = void 0;
class AIProvider {
    constructor(config) {
        this.config = config;
    }
    handleError(error) {
        if (error instanceof Error) {
            return {
                code: 'UNKNOWN_ERROR',
                message: error.message,
                details: error,
            };
        }
        return {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
            details: error,
        };
    }
    async retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
        let lastError = new Error('Unknown error during retry attempts');
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (this.isNonRetryableError(error)) {
                    throw error;
                }
                if (attempt === maxRetries - 1) {
                    throw error;
                }
                const delay = baseDelay * 2 ** attempt;
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
    isNonRetryableError(error) {
        if (error instanceof Error && 'code' in error) {
            const errorCode = error.code;
            return [
                'INVALID_API_KEY',
                'INSUFFICIENT_PERMISSIONS',
                'MODEL_NOT_FOUND',
                'NO_RESPONSE',
            ].includes(errorCode);
        }
        return false;
    }
}
exports.AIProvider = AIProvider;
//# sourceMappingURL=AIProvider.js.map