import Qualification from "../models/Qualification.js";
import { portfolioInput } from "./recordValidation.js";

export const getQualifications = async (req, res) => {
  try {
    const qualifications = await Qualification.find();
    res.status(200).json(qualifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve qualifications." });
  }
};

export const getQualification = async (req, res) => {
  try {
    const qualification = await Qualification.findById(req.params.id);

    if (!qualification) {
      return res.status(404).json({ message: "Qualification not found." });
    }

    res.status(200).json(qualification);
  } catch (error) {
    res.status(400).json({ message: "Invalid qualification ID." });
  }
};

export const createQualification = async (req, res) => {
  const data = portfolioInput(req.body ?? {});
  if (!data) return res.status(400).json({ message: "Enter a title, a valid completion date, and a description within the length limits." });
  res.status(201).json(await Qualification.create(data));
};

export const updateQualification = async (req, res) => {
  const data = portfolioInput(req.body ?? {});
  if (!data) return res.status(400).json({ message: "Enter a title, a valid completion date, and a description within the length limits." });
  const record = await Qualification.findByIdAndUpdate(req.params.id, { $set: data }, {
    new: true,
    runValidators: true,
  });
  if (!record) return res.status(404).json({ message: "Qualification not found." });
  res.json(record);
};

export const deleteQualification = async (req, res) => {
  try {
    const qualification = await Qualification.findByIdAndDelete(
      req.params.id
    );

    if (!qualification) {
      return res.status(404).json({ message: "Qualification not found." });
    }

    res.status(200).json({
      message: "Qualification deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete qualification." });
  }
};
