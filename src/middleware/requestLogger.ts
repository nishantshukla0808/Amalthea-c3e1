// src/middleware/requestLogger.ts
// Request logging middleware

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;

  // Override res.end to log after response is sent
  res.end = function (this: Response, ...args: any[]): Response {
    const duration = Date.now() - startTime;
    
    logger.request(
      req.method,
      req.path,
      res.statusCode,
      duration
    );

    // Call the original end function
    return originalEnd.apply(this, args as any);
  };

  next();
}
