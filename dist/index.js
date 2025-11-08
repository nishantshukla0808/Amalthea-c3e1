"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const database_1 = require("./config/database");
const requestLogger_1 = require("./middleware/requestLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(requestLogger_1.requestLogger);
app.get('/api/health', async (_req, res) => {
    const dbHealth = await (0, database_1.checkDatabaseHealth)();
    res.status(dbHealth.healthy ? 200 : 503).json({
        status: dbHealth.healthy ? 'OK' : 'DEGRADED',
        message: 'WorkZen HRMS API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
            healthy: dbHealth.healthy,
            latency: dbHealth.latency ? `${dbHealth.latency}ms` : undefined,
            error: dbHealth.error,
        },
    });
});
app.get('/', (_req, res) => {
    res.status(200).json({
        message: 'Welcome to WorkZen HRMS API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            docs: '/api/docs (coming soon)',
        },
    });
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.globalErrorHandler);
async function startServer() {
    try {
        const dbConnected = await (0, database_1.testDatabaseConnection)();
        if (!dbConnected) {
            logger_1.logger.error('Failed to connect to database. Server will start but may not work correctly.');
        }
        const server = app.listen(PORT, () => {
            logger_1.logger.info('');
            logger_1.logger.info('╔═══════════════════════════════════════════╗');
            logger_1.logger.info('║     🚀 WorkZen HRMS Server Started       ║');
            logger_1.logger.info('╚═══════════════════════════════════════════╝');
            logger_1.logger.info('');
            logger_1.logger.info(`🌐 Server:      http://localhost:${PORT}`);
            logger_1.logger.info(`🏥 Health:      http://localhost:${PORT}/api/health`);
            logger_1.logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger_1.logger.info(`🗄️  Database:   ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);
            logger_1.logger.info('');
            logger_1.logger.info('📝 Press Ctrl+C to stop the server');
            logger_1.logger.info('');
        });
        const gracefulShutdown = async (signal) => {
            logger_1.logger.info(`\n${signal} received. Closing server gracefully...`);
            server.close(async () => {
                logger_1.logger.info('HTTP server closed');
                await (0, database_1.disconnectDatabase)();
                logger_1.logger.info('Shutdown complete');
                process.exit(0);
            });
            setTimeout(() => {
                logger_1.logger.error('Forcefully shutting down...');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        logger_1.logger.error('Failed to start server', error);
        process.exit(1);
    }
}
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map