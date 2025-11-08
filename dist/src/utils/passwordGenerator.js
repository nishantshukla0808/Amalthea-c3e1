"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecurePassword = generateSecurePassword;
exports.generateTemporaryPassword = generateTemporaryPassword;
const crypto_1 = __importDefault(require("crypto"));
function generateSecurePassword(length = 12) {
    if (length < 12) {
        throw new Error('Password length must be at least 12 characters');
    }
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    password += uppercase[crypto_1.default.randomInt(0, uppercase.length)];
    password += lowercase[crypto_1.default.randomInt(0, lowercase.length)];
    password += numbers[crypto_1.default.randomInt(0, numbers.length)];
    password += specialChars[crypto_1.default.randomInt(0, specialChars.length)];
    const allChars = uppercase + lowercase + numbers + specialChars;
    for (let i = password.length; i < length; i++) {
        password += allChars[crypto_1.default.randomInt(0, allChars.length)];
    }
    password = shuffleString(password);
    return password;
}
function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = crypto_1.default.randomInt(0, i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}
function generateTemporaryPassword() {
    const adjectives = ['Quick', 'Brave', 'Smart', 'Swift', 'Bold', 'Wise', 'Clear'];
    const nouns = ['Tiger', 'Eagle', 'Lion', 'Wolf', 'Bear', 'Hawk', 'Fox'];
    const specialChars = ['!', '@', '#', '$', '%', '&', '*'];
    const adjective = adjectives[crypto_1.default.randomInt(0, adjectives.length)];
    const noun = nouns[crypto_1.default.randomInt(0, nouns.length)];
    const number = crypto_1.default.randomInt(100, 999);
    const special = specialChars[crypto_1.default.randomInt(0, specialChars.length)];
    return `${adjective}${noun}${number}${special}`;
}
//# sourceMappingURL=passwordGenerator.js.map