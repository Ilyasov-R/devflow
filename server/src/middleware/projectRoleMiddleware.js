import pool from "../config/db.js";

const requireProjectRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const projectId =
        req.params.projectId ||
        req.params.id;

      if (!projectId) {
        return res.status(400).json({
          message: "Project ID is required",
        });
      }

      const result = await pool.query(
        `
          SELECT
            role
          FROM project_members
          WHERE project_id = $1
            AND user_id = $2
        `,
        [projectId, req.user.id],
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          message: "You are not a member of this project",
        });
      }

      const role = result.rows[0].role;

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          message: "You do not have permission",
        });
      }

      req.projectRole = role;

      next();
    } catch (error) {
      console.error(
        "Project role middleware error:",
        error,
      );

      res.status(500).json({
        message: "Internal server error",
      });
    }
  };
};

export default requireProjectRole;