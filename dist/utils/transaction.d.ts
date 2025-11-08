import { PrismaClient } from '@prisma/client';
export declare function executeTransaction<T>(callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>): Promise<T>;
export declare function executeTransactionWithRetry<T>(callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>, maxRetries?: number, retryDelay?: number): Promise<T>;
export declare function executeBatch<T, R>(items: T[], operation: (item: T) => Promise<R>, batchSize?: number): Promise<R[]>;
//# sourceMappingURL=transaction.d.ts.map