import express from "express";

import {
  getProjectMembers,
  addProjectMember,
  updateProjectMember,
  deleteProjectMember,
} from "../controllers/projectMemberController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Получить участников проекта
router.get(
  "/projects/:projectId/members",
  authMiddleware,
  getProjectMembers,
);

// Добавить участника
router.post(
  "/projects/:projectId/members",
  authMiddleware,
  addProjectMember,
);

// Изменить роль
router.put(
  "/projects/:projectId/members/:userId",
  authMiddleware,
  updateProjectMember,
);

// Удалить участника
router.delete(
  "/projects/:projectId/members/:userId",
  authMiddleware,
  deleteProjectMember,
);

export default router;