import pool from "../config/db.js";

const getProjects = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, name, description, status, created_at, updated_at
        FROM projects
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [req.user.id],
    );

    res.json({
      projects: result.rows,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO projects (
          name,
          description,
          user_id
        )
        VALUES ($1, $2, $3)
        RETURNING id, name, description, status, created_at, updated_at
      `,
      [name, description || null, req.user.id],
    );

    res.status(201).json({
      message: "Project created successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const result = await pool.query(
      `
        UPDATE projects
        SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
          AND user_id = $5
        RETURNING id, name, description, status, created_at, updated_at
      `,
      [name, description, status, id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      message: "Project updated successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Update project error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        DELETE FROM projects
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    res.json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export { getProjects, createProject, updateProject,deleteProject };
