import pool from "../config/db.js";

// =========================
// GET PROJECT MEMBERS
// =========================

const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
      `
        SELECT
          pm.user_id,
          pm.role,
          pm.created_at,
          u.username,
          u.email
        FROM project_members pm
        JOIN users u
          ON u.id = pm.user_id
        WHERE pm.project_id = $1
        ORDER BY
          CASE pm.role
            WHEN 'owner' THEN 1
            WHEN 'manager' THEN 2
            WHEN 'member' THEN 3
            WHEN 'viewer' THEN 4
          END,
          u.username
      `,
      [projectId],
    );

    res.json({
      members: result.rows,
    });
  } catch (error) {
    console.error(
      "Get project members error:",
      error,
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// =========================
// ADD MEMBER
// =========================

const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const allowedRoles = [
      "manager",
      "member",
      "viewer",
    ];

    const memberRole = role || "member";

    if (!allowedRoles.includes(memberRole)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Проверяем существование пользователя
    const userResult = await pool.query(
      `
        SELECT id, username, email
        FROM users
        WHERE id = $1
      `,
      [userId],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Проверяем, не добавлен ли уже
    const existingMember = await pool.query(
      `
        SELECT id
        FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, userId],
    );

    if (existingMember.rows.length > 0) {
      return res.status(409).json({
        message:
          "User is already a member of this project",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO project_members (
          project_id,
          user_id,
          role
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          project_id,
          user_id,
          role,
          created_at
      `,
      [
        projectId,
        userId,
        memberRole,
      ],
    );

    res.status(201).json({
      message: "Member added successfully",
      member: {
        ...result.rows[0],
        username:
          userResult.rows[0].username,
        email:
          userResult.rows[0].email,
      },
    });
  } catch (error) {
    console.error(
      "Add project member error:",
      error,
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// =========================
// UPDATE MEMBER ROLE
// =========================

const updateProjectMember = async (
  req,
  res,
) => {
  try {
    const { projectId, userId } =
      req.params;

    const { role } = req.body;

    const allowedRoles = [
      "manager",
      "member",
      "viewer",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Нельзя изменить роль владельца
    const ownerCheck = await pool.query(
      `
        SELECT role
        FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, userId],
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    if (
      ownerCheck.rows[0].role ===
      "owner"
    ) {
      return res.status(403).json({
        message:
          "Owner role cannot be changed",
      });
    }

    const result = await pool.query(
      `
        UPDATE project_members
        SET role = $1
        WHERE project_id = $2
          AND user_id = $3
        RETURNING
          id,
          project_id,
          user_id,
          role,
          created_at
      `,
      [
        role,
        projectId,
        userId,
      ],
    );

    res.json({
      message:
        "Member role updated successfully",
      member: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update project member error:",
      error,
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// =========================
// DELETE MEMBER
// =========================

const removeProjectMember = async (
  req,
  res,
) => {
  try {
    const { projectId, userId } =
      req.params;

    // Нельзя удалить владельца
    const ownerCheck = await pool.query(
      `
        SELECT role
        FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, userId],
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    if (
      ownerCheck.rows[0].role ===
      "owner"
    ) {
      return res.status(403).json({
        message:
          "Project owner cannot be removed",
      });
    }

    await pool.query(
      `
        DELETE FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, userId],
    );

    res.json({
      message:
        "Member removed successfully",
    });
  } catch (error) {
    console.error(
      "Remove project member error:",
      error,
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  getProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
};