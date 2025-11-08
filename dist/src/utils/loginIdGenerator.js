"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLoginId = generateLoginId;
exports.validateLoginIdFormat = validateLoginIdFormat;
exports.parseLoginId = parseLoginId;
const database_1 = __importDefault(require("../config/database"));
async function generateLoginId(firstName, lastName, joiningYear) {
    const firstNamePrefix = firstName.substring(0, 2).toUpperCase();
    const lastNamePrefix = lastName.substring(0, 2).toUpperCase();
    const existingCount = await database_1.default.employee.count({
        where: {
            joiningYear: joiningYear,
        },
    });
    const serialNumber = (existingCount + 1).toString().padStart(4, '0');
    const loginId = `OI${firstNamePrefix}${lastNamePrefix}${joiningYear}${serialNumber}`;
    const existing = await database_1.default.user.findUnique({
        where: { loginId },
    });
    if (existing) {
        const nextSerial = (existingCount + 2).toString().padStart(4, '0');
        return `OI${firstNamePrefix}${lastNamePrefix}${joiningYear}${nextSerial}`;
    }
    return loginId;
}
function validateLoginIdFormat(loginId) {
    const regex = /^OI[A-Z]{2}[A-Z]{2}\d{4}\d{4}$/;
    return regex.test(loginId);
}
function parseLoginId(loginId) {
    if (!validateLoginIdFormat(loginId)) {
        return null;
    }
    return {
        companyCode: loginId.substring(0, 2),
        firstNamePrefix: loginId.substring(2, 4),
        lastNamePrefix: loginId.substring(4, 6),
        joiningYear: parseInt(loginId.substring(6, 10)),
        serialNumber: loginId.substring(10, 14),
    };
}
//# sourceMappingURL=loginIdGenerator.js.map