"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = disconnectDatabase;
exports.checkDatabaseHealth = checkDatabaseHealth;
exports.testDatabaseConnection = testDatabaseConnection;
const client_1 = require("@prisma/client");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
        errorFormat: 'pretty',
    });
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
}
async function disconnectDatabase() {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
}
async function checkDatabaseHealth() {
    const start = Date.now();
    try {
        await prisma.$queryRaw `SELECT 1`;
        const latency = Date.now() - start;
        return {
            healthy: true,
            latency,
        };
    }
    catch (error) {
        return {
            healthy: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
async function testDatabaseConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Database connection established');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
exports.default = prisma;
//# sourceMappingURL=database.js.map