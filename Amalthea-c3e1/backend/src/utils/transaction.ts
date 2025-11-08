// src/utils/transaction.ts
// Database transaction utilities

import prisma from '../config/database';
import { PrismaClient } from '@prisma/client';

/**
 * Execute a function within a database transaction
 * Automatically commits on success or rolls back on error
 */
export async function executeTransaction<T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await callback(tx);
  });
}

/**
 * Execute multiple operations in a transaction with retry logic
 */
export async function executeTransactionWithRetry<T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await executeTransaction(callback);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on validation errors or unique constraint violations
      if (error instanceof Error && 
          (error.message.includes('P2002') || 
           error.message.includes('P2025') ||
           error.message.includes('Validation'))) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        console.warn(
          `Transaction attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError || new Error('Transaction failed after retries');
}

/**
 * Batch operations helper
 * Executes operations in chunks to avoid overwhelming the database
 */
export async function executeBatch<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(operation));
    results.push(...batchResults);
  }
  
  return results;
}
