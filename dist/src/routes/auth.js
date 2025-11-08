"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../utils/errorHandler");
const errorHandler_2 = require("../utils/errorHandler");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post('/register', (0, errorHandler_1.asyncHandler)(async (_req, _res) => {
    throw new errorHandler_2.AppError(403, 'Public registration is disabled. Please contact HR to create your account.');
}));
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, loginId, password } = req.body;
    if ((!email && !loginId) || !password) {
        throw new errorHandler_2.AppError(400, 'Email or loginId and password are required');
    }
    const user = await database_1.default.user.findFirst({
        where: {
            OR: [
                { email: email || '' },
                { loginId: loginId || '' },
            ],
        },
    });
    if (!user) {
        throw new errorHandler_2.AppError(401, 'Invalid credentials');
    }
    if (!user.isActive) {
        throw new errorHandler_2.AppError(403, 'Your account has been deactivated');
    }
    const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new errorHandler_2.AppError(401, 'Invalid credentials');
    }
    const token = (0, jwt_1.generateToken)(user);
    const { password: _, ...userWithoutPassword } = user;
    res.json({
        message: 'Login successful',
        token,
        user: userWithoutPassword,
        mustChangePassword: user.mustChangePassword,
    });
}));
router.get('/me', auth_1.verifyTokenMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_2.AppError(401, 'Authentication required');
    }
    const user = await database_1.default.user.findUnique({
        where: { id: req.user.userId },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new errorHandler_2.AppError(404, 'User not found');
    }
    res.json({
        user,
    });
}));
router.post('/change-password', auth_1.verifyTokenMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_2.AppError(401, 'Authentication required');
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new errorHandler_2.AppError(400, 'Current password and new password are required');
    }
    const passwordValidation = (0, password_1.validatePasswordStrength)(newPassword);
    if (!passwordValidation.isValid) {
        throw new errorHandler_2.AppError(400, passwordValidation.errors.join(', '));
    }
    const user = await database_1.default.user.findUnique({
        where: { id: req.user.userId },
    });
    if (!user) {
        throw new errorHandler_2.AppError(404, 'User not found');
    }
    const isPasswordValid = await (0, password_1.comparePassword)(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new errorHandler_2.AppError(401, 'Current password is incorrect');
    }
    const isSamePassword = await (0, password_1.comparePassword)(newPassword, user.password);
    if (isSamePassword) {
        throw new errorHandler_2.AppError(400, 'New password must be different from current password');
    }
    const hashedPassword = await (0, password_1.hashPassword)(newPassword);
    await database_1.default.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            mustChangePassword: false,
            lastPasswordChange: new Date(),
        },
    });
    res.json({
        message: 'Password changed successfully',
    });
}));
router.get('/roles', (_req, res) => {
    const roles = Object.values(client_1.Role);
    res.json({
        roles,
        descriptions: {
            ADMIN: 'Full system access - can manage all resources',
            HR: 'HR management - can manage employees, attendance, and leave',
            PAYROLL: 'Payroll management - can manage salaries and payruns',
            EMPLOYEE: 'Standard employee - can view own information and apply for leave',
        },
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map