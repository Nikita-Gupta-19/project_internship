import { Router } from 'express';
import pool from '../config/db.js';
import authRouter from './auth.js';
import projectsRouter from './projects.js';
import tasksRouter from './tasks.js';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint (verifies server and database connection)
 * @access  Public
 */
router.get('/health', async (req, res) => {
  const healthInfo = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    db: 'unknown'
  };

  try {
    await pool.query('SELECT 1');
    healthInfo.db = 'connected';
    res.status(200).json({ success: true, ...healthInfo });
  } catch (error) {
    healthInfo.message = 'Database Connection Failed';
    healthInfo.db = 'disconnected';
    console.error('[Health Check Error]:', error);
    res.status(503).json({
      success: false,
      ...healthInfo,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Authentication routes
router.use('/auth', authRouter);

// Projects CRUD (GET, POST, PATCH, DELETE /api/projects/...)
router.use('/projects', projectsRouter);

// Tasks CRUD nested under projects (/api/projects/:projectId/tasks/...)
router.use('/projects/:projectId/tasks', tasksRouter);

export default router;

