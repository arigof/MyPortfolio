import Project from "../models/Project.js";

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
  try {
    const { title, completionDate, description } = req.body;

    if (!title || !completionDate || !description) {
      return res.status(400).json({
        message: "Title, completion date, and description are required.",
      });
    }

    const project = await Project.create({
      title,
      completionDate,
      description,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create project.",
      error: error.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: "Failed to update project." });
  }
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