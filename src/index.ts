// src/index.ts
// Main Express server entry point

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { testDatabaseConnection, checkDatabaseHealth, disconnectDatabase } from './config/database';
import { requestLogger } from './middleware/requestLogger';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  
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

// ============================================
// API ROUTES
// ============================================

// Auth routes
app.use('/api/auth', authRoutes);

// ============================================
// ROOT ENDPOINT
// ============================================

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to WorkZen HRMS API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        roles: 'GET /api/auth/roles',
      },
      docs: '/api/docs (coming soon)',
    },
  });
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

// ============================================
// START SERVER
// ============================================

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database. Server will start but may not work correctly.');
    }

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info('');
      logger.info('╔═══════════════════════════════════════════╗');
      logger.info('║     🚀 WorkZen HRMS Server Started       ║');
      logger.info('╚═══════════════════════════════════════════╝');
      logger.info('');
      logger.info(`🌐 Server:      http://localhost:${PORT}`);
      logger.info(`🏥 Health:      http://localhost:${PORT}/api/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🗄️  Database:   ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);
      logger.info('');
      logger.info('📝 Press Ctrl+C to stop the server');
      logger.info('');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Closing server gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        await disconnectDatabase();
        logger.info('Shutdown complete');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forcefully shutting down...');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
