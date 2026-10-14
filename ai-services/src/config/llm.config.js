const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

const requiredEnvironment = ["GEMINI_API_KEY", "GROQ_API_KEY", "PORT"];
const missingEnvironment = requiredEnvironment.filter(
  (name) => !process.env[name],
);

if (missingEnvironment.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvironment.join(", ")}`,
  );
}

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = {
  gemini,
  groq,
  port,
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
};
