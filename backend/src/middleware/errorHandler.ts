// src/middleware/errorHandler.ts
// Global error handling middleware

import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse, AppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // Log error
  logger.error(`Error in ${req.method} ${req.path}`, err);

  // Send error response
  return sendErrorResponse(res, err);
}

// 404 handler
export function notFoundHandler(
  req: Request,
  res: Response
): Response {
  return res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
}
