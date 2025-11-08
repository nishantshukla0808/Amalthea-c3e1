"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.handlePrismaError = handlePrismaError;
exports.sendErrorResponse = sendErrorResponse;
exports.asyncHandler = asyncHandler;
const client_1 = require("@prisma/client");
class AppError extends Error {
    statusCode;
    message;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
function handlePrismaError(error) {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                const target = error.meta?.target;
                const field = target ? target[0] : 'field';
                return new AppError(409, `A record with this ${field} already exists`);
            case 'P2025':
                return new AppError(404, 'Record not found');
            case 'P2003':
                return new AppError(400, 'Related record not found or constraint violation');
            case 'P2014':
                return new AppError(400, 'The change you are trying to make would violate a required relation');
            default:
                return new AppError(500, 'Database operation failed');
        }
    }
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        return new AppError(400, 'Invalid data provided');
    }
    if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        return new AppError(503, 'Database connection failed');
    }
    if (error instanceof AppError) {
        return error;
    }
    return new AppError(500, 'An unexpected error occurred');
}
function sendErrorResponse(res, error) {
    const appError = error instanceof AppError
        ? error
        : handlePrismaError(error);
    const response = {
        success: false,
        error: appError.message,
    };
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        response.stack = error.stack;
    }
    return res.status(appError.statusCode).json(response);
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=errorHandler.js.map