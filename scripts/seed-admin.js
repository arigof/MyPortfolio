import mongoose from "mongoose";
import config from "../config/config.js";
import User from "../models/User.js";
import { validEmail, validPassword } from "../controllers/authControllers.js";

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "Portfolio Administrator" } = process.env;
try {
  if (!config.mongoUri || !validEmail(ADMIN_EMAIL) || !validPassword(ADMIN_PASSWORD) ||
      !ADMIN_NAME.trim() || ADMIN_PASSWORD === "replace-with-a-unique-password") {
    throw new Error("Invalid seed configuration.");
  }

  await mongoose.connect(config.mongoUri);
  await User.init();
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role !== "admin") {
      throw new Error("The configured email belongs to a regular user.");
    }
    console.log("Administrator already exists.");
  } else {
    await User.create({ email, password: ADMIN_PASSWORD, name: ADMIN_NAME, role: "admin" });
    console.log("Administrator created.");
  }
} catch {
  console.error("Admin seeding failed. Check MongoDB, seed configuration, and whether the email is already in use.");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
