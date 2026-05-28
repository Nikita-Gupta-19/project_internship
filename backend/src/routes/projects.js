import { Router } from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  updateProject,
  addMember,
} from '../controllers/projectController.js';

const router = Router();

// All project routes require authentication
router.use(authMiddleware);

/**
 * POST /api/projects
 */
router.post(
  '/',
  validate([
    body('title').notEmpty().withMessage('Title is required').isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
  ]),
  createProject
);

/**
 * GET /api/projects
 */
router.get('/', getProjects);

/**
 * GET /api/projects/:id
 */
router.get('/:id', getProject);

/**
 * PATCH /api/projects/:id
 */
router.patch(
  '/:id',
  validate([
    body('title').optional().notEmpty().withMessage('Title cannot be empty').isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
  ]),
  updateProject
);

/**
 * DELETE /api/projects/:id
 */
router.delete('/:id', deleteProject);

/**
 * POST /api/projects/:id/members
 */
router.post(
  '/:id/members',
  validate([
    body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  ]),
  addMember
);

export default router;
