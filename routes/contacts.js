import express from "express";
import { requireUser, requireAdmin } from "../middleware/auth.js";

import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/contactControllers.js";

const router = express.Router();
router.use(requireUser, requireAdmin);

router.get("/", getContacts);
router.get("/:id", getContact);
router.post("/", createContact);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;
