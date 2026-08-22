import express from "express";

import {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/projects/:projectId/tasks", authMiddleware, getTasksByProject);
router.post("/projects/:projectId/tasks", authMiddleware, createTask);
router.put("/tasks/:taskId", authMiddleware, updateTask);
router.delete("/tasks/:taskId", authMiddleware, deleteTask);

export default router;
