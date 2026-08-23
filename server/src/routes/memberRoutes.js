import express from "express";

import {
  getProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
} from "../controllers/memberController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import requireProjectRole from "../middleware/projectRoleMiddleware.js";
import projectAccess from "../middleware/projectAccessMiddleware.js";

const router = express.Router();

// Получить участников
router.get(
  "/projects/:projectId/members",
  authMiddleware,
  projectAccess,
  getProjectMembers,
);

// Добавить участника
router.post(
  "/projects/:projectId/members",
  authMiddleware,
  projectAccess,
  requireProjectRole("owner", "manager"),
  addProjectMember,
);

// Изменить роль
router.put(
  "/projects/:projectId/members/:userId",
  authMiddleware,
  projectAccess,
  requireProjectRole("owner", "manager"),
  updateProjectMember,
);

// Удалить участника
router.delete(
  "/projects/:projectId/members/:userId",
  authMiddleware,
  projectAccess,
  requireProjectRole("owner", "manager"),
  removeProjectMember,
);

export default router;