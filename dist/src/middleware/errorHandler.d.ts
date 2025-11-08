import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
export declare function globalErrorHandler(err: Error | AppError, req: Request, res: Response, _next: NextFunction): Response;
export declare function notFoundHandler(req: Request, res: Response): Response;
//# sourceMappingURL=errorHandler.d.ts.map