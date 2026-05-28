import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

/**
 * Helper to build custom status errors for middleware routing
 */
const createError = (status, message) => {
  const error = new Error(message);
  error.statusCode = status;
  return error;
};

/**
 * Internal helper to assert that the user owns the project.
 * If validation fails, calls next() with error and returns null.
 */
async function assertProjectOwnership(projectId, userId, next) {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (result.rows.length === 0) {
      next(createError(404, 'Project not found'));
      return null;
    }

    const project = result.rows[0];
    if (project.user_id !== userId) {
      next(createError(403, 'Forbidden'));
      return null;
    }

    return project;
  } catch (error) {
    next(error);
    return null;
  }
}

/**
 * @desc    Create a new task inside a project
 * @route   POST /api/projects/:projectId/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const { title, due_date, priority, category } = req.body;

    const project = await assertProjectOwnership(projectId, userId, next);
    if (!project) return;

    const taskId = uuidv4();

    const result = await pool.query(
      "INSERT INTO tasks (id, project_id, title, status, due_date, priority, category) VALUES ($1, $2, $3, 'pending', $4, $5, $6) RETURNING *",
      [taskId, projectId, title, due_date || null, priority || 'medium', category || null]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get all tasks for a specific project
 * @route   GET /api/projects/:projectId/tasks
 */
export const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const project = await assertProjectOwnership(projectId, userId, next);
    if (!project) return;

    const result = await pool.query(
      'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at ASC',
      [projectId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Update a specific task (supports partial updates)
 * @route   PATCH /api/projects/:projectId/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const { projectId, id: taskId } = req.params;
    const userId = req.user.userId;
    const { title, status, due_date, priority, category } = req.body;

    const project = await assertProjectOwnership(projectId, userId, next);
    if (!project) return;

    // Check if task exists and belongs to the project
    const taskCheck = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND project_id = $2',
      [taskId, projectId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Build query dynamically
    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(title);
    }
    if (status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }
    if (due_date !== undefined) {
      fields.push(`due_date = $${idx++}`);
      values.push(due_date);
    }
    if (priority !== undefined) {
      fields.push(`priority = $${idx++}`);
      values.push(priority);
    }
    if (category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(category);
    }

    if (fields.length === 0) {
      return res.status(200).json({
        success: true,
        data: taskCheck.rows[0],
      });
    }

    values.push(taskId);
    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Delete a specific task
 * @route   DELETE /api/projects/:projectId/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { projectId, id: taskId } = req.params;
    const userId = req.user.userId;

    const project = await assertProjectOwnership(projectId, userId, next);
    if (!project) return;

    // Check if task exists and belongs to the project
    const taskCheck = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND project_id = $2',
      [taskId, projectId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    return res.status(200).json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    return next(error);
  }
};
