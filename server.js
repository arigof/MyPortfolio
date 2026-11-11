import config from "./config/config.js";
import app from "./server/express.js";
import mongoose from "mongoose";
import User from "./models/User.js";

try {
  if (!config.mongoUri || !config.jwtSecret ||
      config.jwtSecret.length < 32 || config.jwtSecret.startsWith("replace-")) {
    throw new Error("Invalid configuration.");
  }
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  await User.init();
  app.listen(config.port, () => console.log("Portfolio API listening on port %s.", config.port));
} catch {
  console.error("API startup failed. Check MONGODB_URI, JWT_SECRET, and MongoDB availability.");
  process.exitCode = 1;
  await mongoose.disconnect();
}
