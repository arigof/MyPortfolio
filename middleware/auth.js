import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import config from "../config/config.js";
import User from "../models/User.js";

export async function requireUser(req, res, next) {
  const match = /^Bearer (\S+)$/i.exec(req.get("Authorization") || "");
  const unauthorized = () => res.status(401).json({ message: "Sign in with a valid access token." });
  if (!match) return unauthorized();

  let claims;
  try {
    claims = jwt.verify(match[1], config.jwtSecret, {
      algorithms: ["HS256"],
      issuer: "my-portfolio",
      audience: "portfolio-api",
    });
  } catch {
    return unauthorized();
  }

  if (!mongoose.isObjectIdOrHexString(claims.sub)) return unauthorized();
  req.user = await User.findById(claims.sub);
  if (!req.user) return unauthorized();
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Administrator access required." });
  }
  next();
}
