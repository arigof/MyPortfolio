import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";

export const validEmail = (email) =>
  typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
export const validPassword = (password) =>
  typeof password === "string" && password.length >= 8 && Buffer.byteLength(password) <= 72;

export const publicUser = ({ _id, name, email, role }) => ({ id: _id, name, email, role });

function session(user) {
  const token = jwt.sign({}, config.jwtSecret, {
    algorithm: "HS256",
    subject: String(user._id),
    issuer: "my-portfolio",
    audience: "portfolio-api",
    expiresIn: "1h",
  });
  return { token, user: publicUser(user), expiresIn: 3600 };
}

export async function signup(req, res) {
  const { name, email, password } = req.body ?? {};
  if (typeof name !== "string" || !name.trim() || name.trim().length > 100 ||
      !validEmail(email) || !validPassword(password)) {
    return res.status(400).json({ message: "Enter a name (up to 100 characters), a valid email, and a password of at least 8 characters and at most 72 bytes." });
  }

  try {
    const user = await User.create({ name, email, password, role: "user" });
    res.status(201).json(session(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email is already registered." });
    }
    throw error;
  }
}

export async function signin(req, res) {
  const { email, password } = req.body ?? {};
  if (!validEmail(email) || !validPassword(password)) {
    return res.status(400).json({ message: "Enter a valid email and password." });
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user?.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  res.json(session(user));
}

export function signout(req, res) {
  res.status(204).end();
}
