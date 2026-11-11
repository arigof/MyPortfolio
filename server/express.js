import express from "express";
import compress from "compression";
import { submitContact } from "../controllers/contactControllers.js";
import helmet from "helmet";

import authRoutes from "../routes/auth.js";
import contactRoutes from "../routes/contacts.js";
import projectRoutes from "../routes/projects.js";
import qualificationRoutes from "../routes/qualifications.js";
import userRoutes from "../routes/users.js";

const app = express();

app.use(express.json({ limit: "32kb" }));
app.use(compress());
app.use(helmet());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to My Portfolio application."
  });
});

app.post("/api/contact-submissions", submitContact);
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/qualifications", qualificationRoutes);
app.use("/api/users", userRoutes);

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