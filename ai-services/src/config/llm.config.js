const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

module.exports = {
  gemini,
  groq,
  port,
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  geminiFallbackModel: process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash",
  groqModel: process.env.GROQ_MODEL || "gemma2-9b-it",
  llmTimeoutMs: 10000,
};
