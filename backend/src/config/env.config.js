const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const required = ["DATABASE_URL", "PORT", "AI_SERVICE_URL"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0 && process.env.NODE_ENV !== "test") {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
}

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port number");
}

module.exports = Object.freeze({
  databaseUrl: process.env.DATABASE_URL,
  port,
  aiServiceUrl: (process.env.AI_SERVICE_URL || "http://localhost:3001").replace(
    /\/+$/,
    "",
  ),
  enableAiFallbackDefault:
    String(process.env.ENABLE_AI_FALLBACK_DEFAULT).toLowerCase() === "true",
  mapsApiKey: process.env.MAPS_API_KEY || "",
  nodeEnv: process.env.NODE_ENV || "development",
});
