"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const loginIdGenerator_1 = require("../utils/loginIdGenerator");
const passwordGenerator_1 = require("../utils/passwordGenerator");
const password_1 = require("../utils/password");
const database_1 = __importDefault(require("../config/database"));
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.post('/', auth_1.verifyTokenMiddleware, (0, auth_1.requireRole)('ADMIN', 'HR_OFFICER'), async (req, res) => {
    try {
        const { email, firstName, lastName, dateOfBirth, dateOfJoining, department, designation, phoneNumber, address, emergencyContact, bankAccountNo, ifscCode, panNumber, aadharNumber, role = 'EMPLOYEE', } = req.body;
        if (!email || !firstName || !lastName || !dateOfJoining) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, firstName, lastName, dateOfJoining',
            });
        }
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
        }
        const joiningDate = new Date(dateOfJoining);
        const joiningYear = joiningDate.getFullYear();
        const loginId = await (0, loginIdGenerator_1.generateLoginId)(firstName, lastName, joiningYear);
        const temporaryPassword = (0, passwordGenerator_1.generateTemporaryPassword)();
        const hashedPassword = await (0, password_1.hashPassword)(temporaryPassword);
        const result = await database_1.default.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    loginId,
                    email,
                    password: hashedPassword,
                    role,
                    mustChangePassword: true,
                    isActive: true,
                },
            });
            const employee = await tx.employee.create({
                data: {
                    userId: user.id,
                    employeeId: loginId,
                    firstName,
                    lastName,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    dateOfJoining: joiningDate,
                    joiningYear,
                    department,
                    designation,
                    phoneNumber,
                    address,
                    emergencyContact,
                    bankAccountNo,
                    ifscCode,
                    panNumber,
                    aadharNumber,
                },
            });
            return { user, employee };
        });
        logger_1.logger.info(`User created: ${loginId} by ${req.user?.email}`);
        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                loginId: result.user.loginId,
                email: result.user.email,
                temporaryPassword,
                role: result.user.role,
                mustChangePassword: true,
                employee: {
                    employeeId: result.employee.employeeId,
                    firstName: result.employee.firstName,
                    lastName: result.employee.lastName,
                    department: result.employee.department,
                    designation: result.employee.designation,
                },
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message,
        });
    }
});
router.get('/', auth_1.verifyTokenMiddleware, (0, auth_1.requireRole)('ADMIN', 'HR_OFFICER'), async (_req, res) => {
    try {
        const users = await database_1.default.user.findMany({
            select: {
                id: true,
                loginId: true,
                email: true,
                role: true,
                isActive: true,
                mustChangePassword: true,
                createdAt: true,
                employee: {
                    select: {
                        employeeId: true,
                        firstName: true,
                        lastName: true,
                        department: true,
                        designation: true,
                        dateOfJoining: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return res.json({
            success: true,
            data: users,
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message,
        });
    }
});
router.get('/:id', auth_1.verifyTokenMiddleware, (0, auth_1.requireRole)('ADMIN', 'HR_OFFICER'), async (req, res) => {
    try {
        const { id } = req.params;
        const user = await database_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                loginId: true,
                email: true,
                role: true,
                isActive: true,
                mustChangePassword: true,
                lastPasswordChange: true,
                createdAt: true,
                updatedAt: true,
                employee: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        return res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map