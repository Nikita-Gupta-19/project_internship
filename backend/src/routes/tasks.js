import { Router } from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = Router({ mergeParams: true });

// All task routes require authentication
router.use(authMiddleware);

/**
 * POST /api/projects/:projectId/tasks
 */
router.post(
  '/',
  validate([
    body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('due_date').optional().isISO8601().withMessage('due_date must be a valid ISO 8601 date'),
  ]),
  createTask
);

/**
 * GET /api/projects/:projectId/tasks
 */
router.get('/', getTasks);

/**
 * PATCH /api/projects/:projectId/tasks/:id
 */
router.patch(
  '/:id',
  validate([
    body('title').optional().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }),
    body('status').optional().isIn(['pending', 'complete']).withMessage('status must be pending or complete'),
    body('due_date').optional({ nullable: true }).isISO8601().withMessage('due_date must be valid ISO 8601'),
  ]),
  updateTask
);

/**
 * DELETE /api/projects/:projectId/tasks/:id
 */
router.delete('/:id', deleteTask);

export default router;
