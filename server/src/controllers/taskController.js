import pool from "../config/db.js";

// =========================================
// GET TASKS
// =========================================

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
          team_id,
          user_id,
          created_at,
          updated_at
        FROM tasks
        WHERE project_id = $1
        ORDER BY created_at DESC
      `,
      [projectId],
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

// =========================================
// CREATE TASK
// =========================================

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;

    const { title, description, status, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    // projectAccess уже проверил,
    // что пользователь имеет доступ к проекту.

    const project = req.project;

    const result = await pool.query(
      `
        INSERT INTO tasks (
          title,
          description,
          status,
          priority,
          project_id,
          team_id,
          user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [
        title.trim(),
        description?.trim() || null,
        status || "todo",
        priority || "medium",
        projectId,
        project.team_id || null,
        req.user.id,
      ],
    );

    res.status(201).json({
      message: "Task created successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// =========================================
// UPDATE TASK
// =========================================

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { title, description, status, priority } = req.body;

    // Получаем задачу + проект
    const taskResult = await pool.query(
      `
        SELECT
          t.id,
          t.project_id
        FROM tasks t
        WHERE t.id = $1
      `,
      [taskId],
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const projectId = taskResult.rows[0].project_id;

    // Проверяем доступ к проекту
    const memberResult = await pool.query(
      `
        SELECT role
        FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, req.user.id],
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    // owner/admin/member могут менять задачи
    const role = memberResult.rows[0].role;

    if (!["owner", "admin", "member"].includes(role)) {
      return res.status(403).json({
        message: "You do not have permission to update tasks",
      });
    }

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
        RETURNING *
      `,
      [title?.trim(), description?.trim() || null, status, priority, taskId],
    );

    res.json({
      message: "Task updated successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// =========================================
// DELETE TASK
// =========================================

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Получаем проект задачи
    const taskResult = await pool.query(
      `
        SELECT
          id,
          project_id
        FROM tasks
        WHERE id = $1
      `,
      [taskId],
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const projectId = taskResult.rows[0].project_id;

    // Проверяем участника проекта
    const memberResult = await pool.query(
      `
        SELECT role
        FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, req.user.id],
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    const role = memberResult.rows[0].role;

    // Только owner/admin
    if (!["owner", "admin"].includes(role)) {
      return res.status(403).json({
        message: "Only owner or admin can delete tasks",
      });
    }

    const result = await pool.query(
      `
        DELETE FROM tasks
        WHERE id = $1
        RETURNING id
      `,
      [taskId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { getTasksByProject, createTask, updateTask, deleteTask };
