"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.extractTokenFromHeader = extractTokenFromHeader;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
function generateToken(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const options = {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'workzen-hrms',
        audience: 'workzen-users',
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
}
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET, {
            issuer: 'workzen-hrms',
            audience: 'workzen-users',
        });
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new errorHandler_1.AppError(401, 'Token has expired. Please login again.');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new errorHandler_1.AppError(401, 'Invalid token. Please login again.');
        }
        throw new errorHandler_1.AppError(401, 'Token verification failed.');
    }
}
function extractTokenFromHeader(authHeader) {
    if (!authHeader) {
        throw new errorHandler_1.AppError(401, 'No authorization header provided');
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new errorHandler_1.AppError(401, 'Invalid authorization header format. Use: Bearer <token>');
    }
    return parts[1];
}
//# sourceMappingURL=jwt.js.map