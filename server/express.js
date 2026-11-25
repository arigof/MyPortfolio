import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import mongoose from "mongoose";
import cors from "cors";
import compress from "compression";
import { submitContact } from "../controllers/contactControllers.js";
import helmet from "helmet";

import authRoutes from "../routes/auth.js";
import contactRoutes from "../routes/contacts.js";
import projectRoutes from "../routes/projects.js";
import qualificationRoutes from "../routes/qualifications.js";
import userRoutes from "../routes/users.js";

const app = express();

app.set("trust proxy", 1);
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.includes(origin));
  },
}));
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use(express.json({ limit: "32kb" }));
app.use(compress());
app.use(helmet());

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "database unavailable",
    commit: process.env.RENDER_GIT_COMMIT || process.env.APP_COMMIT || "local",
  });
});

app.post("/api/contact-submissions", submitContact);
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/qualifications", qualificationRoutes);
app.use("/api/users", userRoutes);

// A single production origin serves React and /api, avoiding cross-origin tokens.
const clientPath = fileURLToPath(new URL("../client/dist/", import.meta.url));
if (existsSync(path.join(clientPath, "index.html"))) {
  app.use("/assets", express.static(path.join(clientPath, "assets"), {
    immutable: true, maxAge: "1y",
  }));
  app.use(express.static(clientPath, { maxAge: "1h", index: false }));
  app.get("/{*page}", (req, res, next) => {
    if (req.path.startsWith("/api/") || path.extname(req.path)) return next();
    res.set("Cache-Control", "no-cache");
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found."
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === "entity.too.large") return res.status(413).json({ message: "Request is too large." });
  if (error.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON." });
  if (error.name === "CastError" || error.name === "ValidationError") {
    return res.status(400).json({ message: "Invalid record data or ID." });
  }
  res.status(500).json({ message: "The server could not complete the request." });
});

export default app;