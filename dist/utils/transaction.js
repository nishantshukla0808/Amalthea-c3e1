"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTransaction = executeTransaction;
exports.executeTransactionWithRetry = executeTransactionWithRetry;
exports.executeBatch = executeBatch;
const database_1 = __importDefault(require("../config/database"));
async function executeTransaction(callback) {
    return await database_1.default.$transaction(async (tx) => {
        return await callback(tx);
    });
}
async function executeTransactionWithRetry(callback, maxRetries = 3, retryDelay = 1000) {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await executeTransaction(callback);
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');
            if (error instanceof Error &&
                (error.message.includes('P2002') ||
                    error.message.includes('P2025') ||
                    error.message.includes('Validation'))) {
                throw error;
            }
            if (attempt < maxRetries - 1) {
                console.warn(`Transaction attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryDelay *= 2;
            }
        }
    }
    throw lastError || new Error('Transaction failed after retries');
}
async function executeBatch(items, operation, batchSize = 100) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(operation));
        results.push(...batchResults);
    }
    return results;
}
//# sourceMappingURL=transaction.js.map