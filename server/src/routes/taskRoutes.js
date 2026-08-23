import express from "express";

import {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import projectAccess from "../middleware/projectAccessMiddleware.js";

const router = express.Router();

// =========================================
// GET TASKS
// =========================================

router.get(
  "/projects/:projectId/tasks",
  authMiddleware,
  projectAccess,
  getTasksByProject,
);

// =========================================
// CREATE TASK
// =========================================

router.post(
  "/projects/:projectId/tasks",
  authMiddleware,
  projectAccess,
  createTask,
);

// =========================================
// UPDATE TASK
// =========================================

router.put(
  "/tasks/:taskId",
  authMiddleware,
  updateTask,
);

// =========================================
// DELETE TASK
// =========================================

router.delete(
  "/tasks/:taskId",
  authMiddleware,
  deleteTask,
);

export default router;
