import Project from "../models/Project.js";
import { portfolioInput } from "./recordValidation.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve projects." });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: "Invalid project ID." });
  }
};

// POST /api/projects
export const createProject = async (req, res) => {
  const data = portfolioInput(req.body ?? {});
  if (!data) return res.status(400).json({ message: "Enter a title, a valid completion date, and a description within the length limits." });
  res.status(201).json(await Project.create(data));
};

export const updateProject = async (req, res) => {
  const data = portfolioInput(req.body ?? {});
  if (!data) return res.status(400).json({ message: "Enter a title, a valid completion date, and a description within the length limits." });
  const record = await Project.findByIdAndUpdate(req.params.id, { $set: data }, {
    new: true,
    runValidators: true,
  });
  if (!record) return res.status(404).json({ message: "Project not found." });
  res.json(record);
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json({ message: "Project deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: "Invalid project ID." });
  }
};
