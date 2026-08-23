import pool from "../config/db.js";

const getMyTeams = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          t.id,
          t.name,
          t.created_at,
          t.updated_at,
          tm.role
        FROM teams t
        INNER JOIN team_members tm
          ON tm.team_id = t.id
        WHERE tm.user_id = $1
        ORDER BY t.created_at DESC
      `,
      [req.user.id],
    );

    res.json({
      teams: result.rows,
    });
  } catch (error) {
    console.error("Get teams error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

    const teamResult = await pool.query(
      `
        SELECT
          t.id,
          t.name,
          t.created_at,
          t.updated_at,
          tm.role
        FROM teams t
        INNER JOIN team_members tm
          ON tm.team_id = t.id
        WHERE t.id = $1
          AND tm.user_id = $2
      `,
      [teamId, req.user.id],
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    const membersResult = await pool.query(
      `
        SELECT
          u.id,
          u.username,
          u.email,
          tm.role,
          tm.created_at
        FROM team_members tm
        INNER JOIN users u
          ON u.id = tm.user_id
        WHERE tm.team_id = $1
        ORDER BY
          CASE tm.role
            WHEN 'owner' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'member' THEN 3
            WHEN 'viewer' THEN 4
          END,
          u.username ASC
      `,
      [teamId],
    );

    res.json({
      team: teamResult.rows[0],
      members: membersResult.rows,
    });
  } catch (error) {
    console.error("Get team error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const createTeam = async (req, res) => {
  const client = await pool.connect();

  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    await client.query("BEGIN");

    const teamResult = await client.query(
      `
        INSERT INTO teams (name)
        VALUES ($1)
        RETURNING
          id,
          name,
          created_at,
          updated_at
      `,
      [name.trim()],
    );

    const team = teamResult.rows[0];

    await client.query(
      `
        INSERT INTO team_members (
          team_id,
          user_id,
          role
        )
        VALUES ($1, $2, 'owner')
      `,
      [team.id, req.user.id],
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Team created successfully",
      team: {
        ...team,
        role: "owner",
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create team error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    const result = await pool.query(
      `
        UPDATE teams
        SET
          name = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING
          id,
          name,
          created_at,
          updated_at
      `,
      [name.trim(), teamId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    res.json({
      message: "Team updated successfully",
      team: result.rows[0],
    });
  } catch (error) {
    console.error("Update team error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const result = await pool.query(
      `
        DELETE FROM teams
        WHERE id = $1
        RETURNING id
      `,
      [teamId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    res.json({
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Delete team error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role = "member" } = req.body;

    const allowedRoles = [
      "admin",
      "member",
      "viewer",
    ];

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

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

    const existingMember = await pool.query(
      `
        SELECT id
        FROM team_members
        WHERE team_id = $1
          AND user_id = $2
      `,
      [teamId, userId],
    );

    if (existingMember.rows.length > 0) {
      return res.status(409).json({
        message: "User is already a member of this team",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO team_members (
          team_id,
          user_id,
          role
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          team_id,
          user_id,
          role,
          created_at
      `,
      [teamId, userId, role],
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
    console.error("Add member error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;

    const allowedRoles = [
      "admin",
      "member",
      "viewer",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const targetMember = await pool.query(
      `
        SELECT id, role
        FROM team_members
        WHERE team_id = $1
          AND user_id = $2
      `,
      [teamId, userId],
    );

    if (targetMember.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    if (targetMember.rows[0].role === "owner") {
      return res.status(400).json({
        message: "Owner role cannot be changed",
      });
    }

    const result = await pool.query(
      `
        UPDATE team_members
        SET role = $1
        WHERE team_id = $2
          AND user_id = $3
        RETURNING
          id,
          team_id,
          user_id,
          role,
          created_at
      `,
      [role, teamId, userId],
    );

    res.json({
      message: "Member role updated successfully",
      member: result.rows[0],
    });
  } catch (error) {
    console.error("Update member role error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const targetMember = await pool.query(
      `
        SELECT role
        FROM team_members
        WHERE team_id = $1
          AND user_id = $2
      `,
      [teamId, userId],
    );

    if (targetMember.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    if (targetMember.rows[0].role === "owner") {
      return res.status(400).json({
        message: "Owner cannot be removed from the team",
      });
    }

    await pool.query(
      `
        DELETE FROM team_members
        WHERE team_id = $1
          AND user_id = $2
      `,
      [teamId, userId],
    );

    res.json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const inviteMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, role = "member" } = req.body;

    const allowedRoles = ["admin", "member", "viewer"];

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Ищем пользователя
    const userResult = await pool.query(
      `
        SELECT id, username, email
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `,
      [email.trim()],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User with this email not found",
      });
    }

    const user = userResult.rows[0];

    // Нельзя пригласить самого себя
    if (user.id === req.user.id) {
      return res.status(400).json({
        message: "You cannot invite yourself",
      });
    }

    // Проверяем, не является ли пользователь уже участником
    const memberResult = await pool.query(
      `
        SELECT id
        FROM team_members
        WHERE team_id = $1
          AND user_id = $2
      `,
      [teamId, user.id],
    );

    if (memberResult.rows.length > 0) {
      return res.status(409).json({
        message: "User is already a member of this team",
      });
    }

    // Проверяем существующее приглашение
    const invitationResult = await pool.query(
      `
        SELECT id
        FROM team_invitations
        WHERE team_id = $1
          AND invitee_id = $2
          AND status = 'pending'
      `,
      [teamId, user.id],
    );

    if (invitationResult.rows.length > 0) {
      return res.status(409).json({
        message: "Invitation already exists",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO team_invitations (
          team_id,
          inviter_id,
          invitee_id,
          role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          team_id,
          inviter_id,
          invitee_id,
          role,
          status,
          created_at
      `,
      [
        teamId,
        req.user.id,
        user.id,
        role,
      ],
    );

    res.status(201).json({
      message: "Invitation sent successfully",

      invitation: {
        ...result.rows[0],
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Invite member error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptInvitation = async (req, res) => {
  const client = await pool.connect();

  try {
    const { invitationId } = req.params;

    await client.query("BEGIN");

    const invitationResult = await client.query(
      `
        SELECT
          id,
          team_id,
          invitee_id,
          role,
          status
        FROM team_invitations
        WHERE id = $1
          AND invitee_id = $2
      `,
      [invitationId, req.user.id],
    );

    if (invitationResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    const invitation = invitationResult.rows[0];

    if (invitation.status !== "pending") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Invitation is no longer active",
      });
    }

    await client.query(
      `
        INSERT INTO team_members (
          team_id,
          user_id,
          role
        )
        VALUES ($1, $2, $3)
      `,
      [
        invitation.team_id,
        req.user.id,
        invitation.role,
      ],
    );

    await client.query(
      `
        UPDATE team_invitations
        SET status = 'accepted'
        WHERE id = $1
      `,
      [invitationId],
    );

    await client.query("COMMIT");

    res.json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Accept invitation error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

const rejectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const result = await pool.query(
      `
        UPDATE team_invitations
        SET status = 'rejected'
        WHERE id = $1
          AND invitee_id = $2
          AND status = 'pending'
        RETURNING id
      `,
      [invitationId, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    res.json({
      message: "Invitation rejected",
    });
  } catch (error) {
    console.error("Reject invitation error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getMyInvitations = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          ti.id,
          ti.team_id,
          ti.role,
          ti.status,
          ti.created_at,

          t.name AS team_name,

          u.username AS inviter_username,
          u.email AS inviter_email

        FROM team_invitations ti

        INNER JOIN teams t
          ON t.id = ti.team_id

        INNER JOIN users u
          ON u.id = ti.inviter_id

        WHERE ti.invitee_id = $1
          AND ti.status = 'pending'

        ORDER BY ti.created_at DESC
      `,
      [req.user.id],
    );

    res.json({
      invitations: result.rows,
    });
  } catch (error) {
    console.error("Get invitations error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  getMyTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  updateMemberRole,
  removeMember,
  inviteMember,
  acceptInvitation,
  rejectInvitation,
  getMyInvitations
};