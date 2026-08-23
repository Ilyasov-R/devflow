import express from "express";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import projectAccess from "../middleware/projectAccessMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getProjects);

router.post("/", authMiddleware, createProject);

router.put("/:id", authMiddleware, projectAccess, updateProject);

router.delete("/:id", authMiddleware, projectAccess, deleteProject);

export default router;
