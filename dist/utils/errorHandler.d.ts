import { Response } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    isOperational: boolean;
    constructor(statusCode: number, message: string, isOperational?: boolean);
}
export declare function handlePrismaError(error: unknown): AppError;
export declare function sendErrorResponse(res: Response, error: unknown): Response;
export declare function asyncHandler(fn: (req: any, res: any, next: any) => Promise<any>): (req: any, res: any, next: any) => void;
//# sourceMappingURL=errorHandler.d.ts.map