import pool from "../config/db.js";

// =========================
// GET PROJECT MEMBERS
// =========================
const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Проверяем, что текущий пользователь имеет доступ
    const accessResult = await pool.query(
      `
        SELECT role
        FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, req.user.id],
    );

    if (accessResult.rows.length === 0) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    const result = await pool.query(
      `
        SELECT
          pm.id,
          pm.user_id,
          pm.project_id,
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
            WHEN 'admin' THEN 2
            WHEN 'member' THEN 3
            WHEN 'viewer' THEN 4
            ELSE 5
          END,
          pm.created_at ASC
      `,
      [projectId],
    );

    res.json({
      members: result.rows,
    });
  } catch (error) {
    console.error("Get project members error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// =========================
// ADD PROJECT MEMBER
// =========================
const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role = "member" } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const allowedRoles = ["admin", "member", "viewer"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Проверяем права текущего пользователя
    const accessResult = await pool.query(
      `
        SELECT role
        FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, req.user.id],
    );

    if (accessResult.rows.length === 0) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    const currentRole = accessResult.rows[0].role;

    if (
      currentRole !== "owner" &&
      currentRole !== "admin"
    ) {
      return res.status(403).json({
        message: "You do not have permission to add members",
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

    // Проверяем, не добавлен ли пользователь уже
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
        message: "User is already a member of this project",
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
      [projectId, userId, role],
    );

    res.status(201).json({
      message: "Member added successfully",
      member: {
        ...result.rows[0],
        username: userResult.rows[0].username,
        email: userResult.rows[0].email,
      },
    });
  } catch (error) {
    console.error("Add project member error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// =========================
// UPDATE MEMBER ROLE
// =========================
const updateProjectMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    const allowedRoles = [
      "owner",
      "admin",
      "member",
      "viewer",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Проверяем текущего пользователя
    const currentUserResult = await pool.query(
      `
        SELECT role
        FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, req.user.id],
    );

    if (currentUserResult.rows.length === 0) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    const currentRole =
      currentUserResult.rows[0].role;

    // Только owner может менять owner/admin
    if (role === "owner") {
      if (currentRole !== "owner") {
        return res.status(403).json({
          message: "Only the owner can assign the owner role",
        });
      }
    } else if (
      currentRole !== "owner" &&
      currentRole !== "admin"
    ) {
      return res.status(403).json({
        message: "You do not have permission to change roles",
      });
    }

    // Нельзя изменить роль владельца не-владельцем
    const targetMemberResult = await pool.query(
      `
        SELECT role
        FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, userId],
    );

    if (targetMemberResult.rows.length === 0) {
      return res.status(404).json({
        message: "Project member not found",
      });
    }

    const targetRole =
      targetMemberResult.rows[0].role;

    if (
      targetRole === "owner" &&
      currentRole !== "owner"
    ) {
      return res.status(403).json({
        message: "Only the owner can change the owner's role",
      });
    }

    // Не позволяем случайно оставить проект без owner
    if (
      targetRole === "owner" &&
      role !== "owner"
    ) {
      return res.status(400).json({
        message: "The project must have an owner",
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
      [role, projectId, userId],
    );

    res.json({
      message: "Member role updated successfully",
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
// DELETE PROJECT MEMBER
// =========================
const deleteProjectMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    // Проверяем текущего пользователя
    const currentUserResult = await pool.query(
      `
        SELECT role
        FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, req.user.id],
    );

    if (currentUserResult.rows.length === 0) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    const currentRole =
      currentUserResult.rows[0].role;

    // Получаем удаляемого участника
    const targetMemberResult = await pool.query(
      `
        SELECT role
        FROM project_members
        WHERE project_id = $1
          AND user_id = $2
      `,
      [projectId, userId],
    );

    if (targetMemberResult.rows.length === 0) {
      return res.status(404).json({
        message: "Project member not found",
      });
    }

    const targetRole =
      targetMemberResult.rows[0].role;

    // Owner может удалить любого кроме себя
    // Admin может удалять member/viewer
    if (targetRole === "owner") {
      return res.status(403).json({
        message: "The project owner cannot be removed",
      });
    }

    if (
      currentRole !== "owner" &&
      currentRole !== "admin"
    ) {
      return res.status(403).json({
        message: "You do not have permission to remove members",
      });
    }

    if (
      currentRole === "admin" &&
      targetRole === "admin"
    ) {
      return res.status(403).json({
        message: "Admin cannot remove another admin",
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
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error(
      "Delete project member error:",
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
  deleteProjectMember,
};