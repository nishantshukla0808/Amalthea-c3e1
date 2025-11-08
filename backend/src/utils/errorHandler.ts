// src/utils/errorHandler.ts
// Centralized error handling utilities

import { Response } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Prisma errors
export function handlePrismaError(error: unknown): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = error.meta?.target as string[] | undefined;
        const field = target ? target[0] : 'field';
        return new AppError(
          409,
          `A record with this ${field} already exists`
        );
      
      case 'P2025':
        // Record not found
        return new AppError(404, 'Record not found');
      
      case 'P2003':
        // Foreign key constraint failed
        return new AppError(
          400,
          'Related record not found or constraint violation'
        );
      
      case 'P2014':
        // Required relation violation
        return new AppError(
          400,
          'The change you are trying to make would violate a required relation'
        );
      
      default:
        return new AppError(500, 'Database operation failed');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError(400, 'Invalid data provided');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError(503, 'Database connection failed');
  }

  if (error instanceof AppError) {
    return error;
  }

  // Unknown error
  return new AppError(500, 'An unexpected error occurred');
}

// Send error response
export function sendErrorResponse(
  res: Response,
  error: unknown
): Response {
  const appError = error instanceof AppError 
    ? error 
    : handlePrismaError(error);

  const response: any = {
    success: false,
    error: appError.message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    response.stack = error.stack;
  }

  return res.status(appError.statusCode).json(response);
}

// Async handler wrapper to catch errors in async routes
export function asyncHandler(
  fn: (req: any, res: any, next: any) => Promise<any>
) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
