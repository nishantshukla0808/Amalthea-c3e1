// src/index.ts
// Main Express server entry point

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

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
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'WorkZen HRMS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ============================================
// ROOT ENDPOINT
// ============================================

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to WorkZen HRMS API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      docs: '/api/docs (coming soon)',
    },
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║     🚀 WorkZen HRMS Server Started       ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Server:      http://localhost:${PORT}`);
  console.log(`🏥 Health:      http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📝 Press Ctrl+C to stop the server');
  console.log('');
});

export default app;
