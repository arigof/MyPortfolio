import express from "express";
import { requireUser, requireAdmin } from "../middleware/auth.js";

import {
  getQualifications,
  getQualification,
  createQualification,
  updateQualification,
  deleteQualification,
} from "../controllers/qualificationControllers.js";

const router = express.Router();
router.use(requireUser);

router.get("/", getQualifications);

router.get("/:id", getQualification);

router.post("/", requireAdmin, createQualification);

router.put("/:id", requireAdmin, updateQualification);

router.delete("/:id", requireAdmin, deleteQualification);

export default router;
