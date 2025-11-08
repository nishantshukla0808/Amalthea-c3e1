"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenMiddleware = void 0;
exports.requireRole = requireRole;
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../utils/errorHandler");
const errorHandler_2 = require("../utils/errorHandler");
const database_1 = __importDefault(require("../config/database"));
exports.verifyTokenMiddleware = (0, errorHandler_2.asyncHandler)(async (req, _res, next) => {
    const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
    const payload = (0, jwt_1.verifyToken)(token);
    const user = await database_1.default.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user) {
        throw new errorHandler_1.AppError(401, 'User no longer exists');
    }
    if (!user.isActive) {
        throw new errorHandler_1.AppError(403, 'Your account has been deactivated');
    }
    req.user = payload;
    next();
});
function requireRole(...allowedRoles) {
    return (0, errorHandler_2.asyncHandler)(async (req, _res, next) => {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Authentication required');
        }
        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            throw new errorHandler_1.AppError(403, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
        }
        next();
    });
}
//# sourceMappingURL=auth.js.map