import Contact from "../models/Contact.js";
import { contactInput } from "./recordValidation.js";

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve contacts." });
  }
};

export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found." });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(400).json({ message: "Invalid contact ID." });
  }
};

export const createContact = async (req, res) => {
  const data = contactInput(req.body ?? {});
  if (!data) return res.status(400).json({ message: "Enter first and last names and a valid email. Check the phone and message lengths." });
  res.status(201).json(await Contact.create(data));
};

export const updateContact = async (req, res) => {
  const data = contactInput(req.body ?? {});
  if (!data) return res.status(400).json({ message: "Enter first and last names and a valid email. Check the phone and message lengths." });
  const record = await Contact.findByIdAndUpdate(req.params.id, { $set: data }, {
    new: true,
    runValidators: true,
  });
  if (!record) return res.status(404).json({ message: "Contact not found." });
  res.json(record);
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found." });
    }

    res.status(200).json({ message: "Contact deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete contact." });
  }
};

export async function submitContact(req, res) {
  const data = contactInput(req.body ?? {}, true);
  if (!data) {
    return res.status(400).json({ message: "Enter your name, phone, valid email, and message within the length limits." });
  }
  const contact = await Contact.create(data);
  res.status(201).json({ message: "Message sent.", submissionId: contact.id });
}
