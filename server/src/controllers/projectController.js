import pool from "../config/db.js";

// =========================================
// GET PROJECTS
// =========================================

const getProjects = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          p.id,
          p.name,
          p.description,
          p.status,
          p.team_id,
          p.user_id,
          p.created_at,
          p.updated_at,
          pm.role
        FROM projects p
        INNER JOIN project_members pm
          ON pm.project_id = p.id
        WHERE pm.user_id = $1
        ORDER BY p.created_at DESC
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

// =========================================
// CREATE PROJECT
// =========================================

const createProject = async (req, res) => {
  const client = await pool.connect();

  try {
    const { name, description, status = "active" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    await client.query("BEGIN");

    // =========================================
    // ИЩЕМ КОМАНДУ ПОЛЬЗОВАТЕЛЯ
    // =========================================

    let teamResult = await client.query(
      `
        SELECT
          t.id,
          t.name,
          tm.role
        FROM teams t
        INNER JOIN team_members tm
          ON tm.team_id = t.id
        WHERE tm.user_id = $1
        ORDER BY
          CASE tm.role
            WHEN 'owner' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'member' THEN 3
            WHEN 'viewer' THEN 4
          END,
          t.created_at ASC
        LIMIT 1
      `,
      [req.user.id],
    );

    // =========================================
    // ЕСЛИ КОМАНДЫ НЕТ — СОЗДАЁМ
    // =========================================

    if (teamResult.rows.length === 0) {
      const newTeamResult = await client.query(
        `
          INSERT INTO teams (name)
          VALUES ($1)
          RETURNING
            id,
            name,
            created_at,
            updated_at
        `,
        [`${req.user.id} Workspace`],
      );

      const newTeam = newTeamResult.rows[0];

      await client.query(
        `
          INSERT INTO team_members (
            team_id,
            user_id,
            role
          )
          VALUES ($1, $2, 'owner')
        `,
        [newTeam.id, req.user.id],
      );

      teamResult = {
        rows: [
          {
            id: newTeam.id,
            name: newTeam.name,
            role: "owner",
          },
        ],
      };
    }

    const teamId = teamResult.rows[0].id;

    // =========================================
    // СОЗДАЁМ ПРОЕКТ
    // =========================================

    const projectResult = await client.query(
      `
        INSERT INTO projects (
          name,
          description,
          status,
          user_id,
          team_id
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          name,
          description,
          status,
          team_id,
          user_id,
          created_at,
          updated_at
      `,
      [name.trim(), description?.trim() || null, status, req.user.id, teamId],
    );

    const project = projectResult.rows[0];

    // =========================================
    // СОЗДАТЕЛЬ = OWNER ПРОЕКТА
    // =========================================

    await client.query(
      `
        INSERT INTO project_members (
          project_id,
          user_id,
          role
        )
        VALUES ($1, $2, 'owner')
        ON CONFLICT (project_id, user_id)
        DO NOTHING
      `,
      [project.id, req.user.id],
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Project created successfully",

      project: {
        ...project,
        role: "owner",
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create project error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

// =========================================
// UPDATE PROJECT
// =========================================

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    // Получаем проект и роль пользователя в проекте
    const projectResult = await pool.query(
      `
        SELECT
          p.id,
          p.name,
          p.description,
          p.status,
          p.team_id,
          p.user_id,
          pm.role
        FROM projects p
        INNER JOIN project_members pm
          ON pm.project_id = p.id
        WHERE p.id = $1
          AND pm.user_id = $2
      `,
      [id, req.user.id],
    );

    if (projectResult.rows.length === 0) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    const project = projectResult.rows[0];

    // Owner и admin могут редактировать проект
    if (!["owner", "admin"].includes(project.role)) {
      return res.status(403).json({
        message: "Only owner or admin can update projects",
      });
    }

    const result = await pool.query(
      `
        UPDATE projects
        SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING
          id,
          name,
          description,
          status,
          team_id,
          user_id,
          created_at,
          updated_at
      `,
      [
        name?.trim() || null,
        description !== undefined ? description.trim() : null,
        status || null,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      message: "Project updated successfully",
      project: {
        ...result.rows[0],
        role: project.role,
      },
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

    // Проверяем доступ пользователя к проекту
    const projectResult = await pool.query(
      `
        SELECT
          p.id,
          p.team_id,
          pm.role
        FROM projects p
        INNER JOIN project_members pm
          ON pm.project_id = p.id
        WHERE p.id = $1
          AND pm.user_id = $2
      `,
      [id, req.user.id],
    );

    if (projectResult.rows.length === 0) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    const project = projectResult.rows[0];

    // Только owner и admin
    if (!["owner", "admin"].includes(project.role)) {
      return res.status(403).json({
        message: "Only owner or admin can delete projects",
      });
    }

    const result = await pool.query(
      `
        DELETE FROM projects
        WHERE id = $1
        RETURNING id
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { getProjects, createProject, updateProject, deleteProject };
