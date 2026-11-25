import { validEmail } from "./authControllers.js";

function text(value, maxLength, required = true) {
  if (typeof value !== "string" || value.trim().length > maxLength || (required && !value.trim())) {
    return null;
  }
  return value.trim();
}

export function portfolioInput({ title, completionDate, description } = {}) {
  title = text(title, 150);
  description = text(description, 4000);
  if (!title || !description || typeof completionDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(completionDate)) return null;
  const date = new Date(completionDate);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== completionDate) return null;
  return { title, completionDate: date, description };
}

export function contactInput({ firstName, lastName, phone = "", email, message = "" } = {}, publicForm = false) {
  firstName = text(firstName, 100);
  lastName = text(lastName, 100);
  phone = text(phone, 40, publicForm);
  message = text(message, 4000, publicForm);
  if (!firstName || !lastName || phone === null || message === null || !validEmail(email)) return null;
  return { firstName, lastName, phone, email: email.trim().toLowerCase(), message };
}
