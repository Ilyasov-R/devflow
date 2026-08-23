import pool from "../config/db.js";

const projectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required",
      });
    }

    const result = await pool.query(
      `
        SELECT
          pm.role,
          p.id,
          p.name,
          p.description,
          p.status,
          p.team_id,
          p.user_id
        FROM project_members pm
        JOIN projects p
          ON p.id = pm.project_id
        WHERE pm.project_id = $1
          AND pm.user_id = $2
      `,
      [projectId, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    req.project = result.rows[0];
    req.projectRole = result.rows[0].role;

    next();
  } catch (error) {
    console.error("Project access error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default projectAccess;
