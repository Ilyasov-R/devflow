import pool from "../config/db.js";

const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
      `
        SELECT
          id,
          title,
          description,
          status,
          priority,
          project_id,
          user_id,
          created_at,
          updated_at
        FROM tasks
        WHERE project_id = $1
          AND user_id = $2
        ORDER BY created_at DESC
      `,
      [projectId, req.user.id],
    );

    res.json({
      tasks: result.rows,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      status,
      priority,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: 'Task title is required',
      });
    }

    const result = await pool.query(
      `
        INSERT INTO tasks (
          title,
          description,
          status,
          priority,
          project_id,
          user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        title,
        description || null,
        status || 'todo',
        priority || 'medium',
        projectId,
        req.user.id,
      ]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Create task error:', error);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      description,
      status,
      priority,
    } = req.body;

    const result = await pool.query(
      `
        UPDATE tasks
        SET
          title = $1,
          description = $2,
          status = $3,
          priority = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
          AND user_id = $6
        RETURNING *
      `,
      [
        title,
        description,
        status,
        priority,
        taskId,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    res.json({
      message: 'Task updated successfully',
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Update task error:', error);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await pool.query(
      `
        DELETE FROM tasks
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [taskId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    res.json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export { getTasksByProject , createTask,updateTask,deleteTask};
