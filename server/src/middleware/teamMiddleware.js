import pool from "../config/db.js";

const getTeamMembership = async (userId, teamId) => {
  const result = await pool.query(
    `
      SELECT
        id,
        team_id,
        user_id,
        role
      FROM team_members
      WHERE team_id = $1
        AND user_id = $2
    `,
    [teamId, userId],
  );

  return result.rows[0] || null;
};

const requireTeamMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({
        message: "Team ID is required",
      });
    }

    const membership = await getTeamMembership(
      req.user.id,
      teamId,
    );

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this team",
      });
    }

    req.teamMember = membership;

    next();
  } catch (error) {
    console.error("Team membership error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const requireTeamRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.teamMember) {
        return res.status(403).json({
          message: "Team membership is required",
        });
      }

      if (!allowedRoles.includes(req.teamMember.role)) {
        return res.status(403).json({
          message: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error("Team role error:", error);

      res.status(500).json({
        message: "Internal server error",
      });
    }
  };
};

export {
  requireTeamMember,
  requireTeamRoles,
};