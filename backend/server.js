import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './src/routes/index.js';
import { errorHandler } from './src/middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Enable parsing of JSON request bodies
app.use(express.json());

// Enable parsing of URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Log basic request details in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Mount central API routes
app.use('/api', apiRouter);

// Global Error Handler Middleware
app.use(errorHandler);

// Start the server
const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(` Listening on port: ${PORT}`);
  console.log(` Health check URL: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});

// Handle uncaught exceptions and unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process Error] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Process Error] Uncaught Exception:', error);
  // Gracefully close server and exit
  server.close(() => {
    process.exit(1);
  });
});
