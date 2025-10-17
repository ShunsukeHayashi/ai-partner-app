/**
 * AI Partner App - Backend Entry Point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createLogger } from './utils/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { initializeUploadDirectories } from './utils/image-storage.js';
import { initBytePlus } from './services/byteplus/index.js';
import authRoutes from './routes/auth.js';
import characterRoutes from './routes/character.js';
import conversationRoutes from './routes/conversation.js';
import testRoutes from './routes/test.js';

// Load environment variables
dotenv.config();

const logger = createLogger('server');
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize upload directories on startup
await initializeUploadDirectories();

// Initialize BytePlus SDK
if (process.env.BYTEPLUS_API_KEY) {
  initBytePlus(process.env.BYTEPLUS_API_KEY);
  logger.info('BytePlus SDK initialized');
} else {
  logger.warn('BYTEPLUS_API_KEY not found - image/video generation will not work');
}

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
// Increase body size limit for image uploads (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Serve static files (uploaded images and generated images)
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    name: 'AI Partner App API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      characters: '/api/characters',
      conversations: '/api/conversations',
    },
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/test', testRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
