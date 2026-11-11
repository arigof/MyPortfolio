import express from "express";
import { requireUser } from "../middleware/auth.js";

import {
  signup,
  signin,
  signout,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.post("/signout", requireUser, signout);

export default router;
