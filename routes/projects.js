import express from "express";
import { requireUser, requireAdmin } from "../middleware/auth.js";

import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectControllers.js";

const router = express.Router();
router.use(requireUser);

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", requireAdmin, createProject);
router.put("/:id", requireAdmin, updateProject);
router.delete("/:id", requireAdmin, deleteProject);

export default router;
