import express from "express";
import { requireUser, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();
router.use(requireUser, requireAdmin);

const safeUser = (user) => {
  const result = user.toObject ? user.toObject() : { ...user };
  delete result.password;
  delete result.hashed_password;
  delete result.__v;
  return result;
};

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users.map(safeUser));
  } catch (error) {
    res.status(500).json({ message: "Unable to retrieve users." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(safeUser(user));
  } catch (error) {
    res.status(400).json({ message: "Invalid user ID." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim() || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required."
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists."
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password
    });

    res.status(201).json(safeUser(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists."
      });
    }

    res.status(500).json({
      message: "Unable to create user."
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = {};

    if (typeof req.body.name === "string") {
      updates.name = req.body.name.trim();
    }

    if (typeof req.body.email === "string") {
      updates.email = req.body.email.trim().toLowerCase();
    }

    if (req.body.password !== undefined) {
      if (
        typeof req.body.password !== "string" ||
        req.body.password.length < 8
      ) {
        return res.status(400).json({
          message: "Password must be at least 8 characters."
        });
      }

      updates.password = await bcrypt.hash(req.body.password, 12);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.status(200).json(safeUser(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists."
      });
    }

    res.status(400).json({
      message: "Unable to update user."
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.status(200).json({
      message: "User deleted successfully."
    });
  } catch (error) {
    res.status(400).json({
      message: "Invalid user ID."
    });
  }
});

export default router;
