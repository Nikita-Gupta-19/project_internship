import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 */
export const createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.userId;
    const id = uuidv4();

    const result = await pool.query(
      'INSERT INTO projects (id, user_id, title, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, userId, title, description || null]
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
 * @desc    Get all projects for the authenticated user
 * @route   GET /api/projects
 */
export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
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
 * @desc    Get a single project by ID (with ownership check)
 * @route   GET /api/projects/:id
 */
export const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = result.rows[0];

    if (project.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Delete a project by ID (with ownership check)
 * @route   DELETE /api/projects/:id
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = result.rows[0];

    if (project.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Project deleted',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Update a project title/description (with ownership check)
 * @route   PATCH /api/projects/:id
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, description } = req.body;

    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const project = result.rows[0];

    if (project.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Merge: fall back to existing value if field not provided
    const newTitle = title !== undefined ? title : project.title;
    const newDescription = description !== undefined ? description : project.description;

    const updated = await pool.query(
      'UPDATE projects SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [newTitle, newDescription, id]
    );

    return res.status(200).json({ success: true, data: updated.rows[0] });
  } catch (error) {
    return next(error);
  }
};

