const {
  gemini,
  groq,
  geminiModel,
  geminiFallbackModel,
  groqModel,
  llmTimeoutMs,
} = require("../config/llm.config");

/**
 * Runs each configured provider in deterministic priority order.
 * @param {string} systemPrompt
 * @param {*} input
 * @param {object} schema
 * @param {object} defaultValues
 * @param {Array<object>} [images]
 * @returns {Promise<{success: boolean, data: object, fallbackUsed: boolean, usedProvider: string, executionTimeMs: number}>}
 */
async function runStructuredLlm(
  systemPrompt,
  input,
  schema,
  defaultValues,
  images = [],
) {
  const startedAt = Date.now();
  const prompt = `${systemPrompt}\n\nUntrusted request data:\n${JSON.stringify(input)}`;
  const contents = images.length
    ? [{ role: "user", parts: [{ text: prompt }, ...images] }]
    : prompt;
  const providers = [
    { name: "Gemini", label: geminiModel, call: () => callGemini(geminiModel, contents, schema) },
    { name: "Gemini fallback", label: geminiFallbackModel, call: () => callGemini(geminiFallbackModel, contents, schema) },
    { name: "Groq", label: `groq-${groqModel}`, call: () => callGroq(systemPrompt, prompt, schema) },
  ];

  let fallbackUsed = false;
  for (const provider of providers) {
    if (provider.name.startsWith("Gemini") && !gemini) {
      console.warn(`[ai-services] ${provider.name} API key missing; skipping ${provider.label}.`);
      fallbackUsed = true;
      continue;
    }
    if (provider.name === "Groq" && !groq) {
      console.warn("[ai-services] Groq API key missing; skipping provider.");
      fallbackUsed = true;
      continue;
    }
    try {
      return {
        success: true,
        data: await provider.call(),
        fallbackUsed,
        usedProvider: provider.label,
        executionTimeMs: Date.now() - startedAt,
      };
    } catch (error) {
      fallbackUsed = true;
      logProviderError(provider.name, error);
    }
  }
  return {
    success: false,
    fallbackUsed: true,
    usedProvider: "safe-default",
    executionTimeMs: Date.now() - startedAt,
    data: defaultValues,
  };
}

async function callGemini(model, contents, schema) {
  let retryContents = contents;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await withTimeout(async () => {
        const response = await gemini.models.generateContent({
          model,
          contents: retryContents,
          config: {
            responseMimeType: "application/json",
            responseSchema: sanitizeSchema(schema),
            temperature: 0,
          },
        });
        return parseJsonOrThrow(response.text, schema);
      });
    } catch (error) {
      if (attempt === 1 || !error.message.startsWith("Invalid LLM JSON")) throw error;
      retryContents = addJsonRetryInstruction(contents);
    }
  }
}

async function callGroq(systemPrompt, prompt, schema) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await withTimeout(async (signal) => {
        const response = await groq.chat.completions.create({
          model: groqModel,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: attempt === 0 ? prompt : addJsonRetryInstruction(prompt) },
          ],
        }, { signal });
        return parseJsonOrThrow(response.choices[0]?.message?.content, schema);
      });
    } catch (error) {
      if (attempt === 1 || !error.message.startsWith("Invalid LLM JSON")) throw error;
    }
  }
}

function addJsonRetryInstruction(contents) {
  const instruction = "\nRETRY: Return only one valid JSON object matching the schema. No Markdown or explanation.";
  if (typeof contents === "string") return `${contents}${instruction}`;
  return contents.map((content) => ({
    ...content,
    parts: [...content.parts, { text: instruction }],
  }));
}

async function withTimeout(operation) {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      operation(controller.signal),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error("LLM request timed out"));
        }, llmTimeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function parseJsonOrThrow(rawText, schema) {
  const parsed = cleanAndParseJson(rawText, schema);
  if (!parsed.success) throw new Error(parsed.error);
  return parsed.data;
}

/**
 * Removes fences and validates an LLM JSON object without throwing SyntaxError.
 * One retry is performed by the provider loop when this helper reports failure.
 * @param {*} rawText
 * @param {object} schema
 * @returns {{success: boolean, data?: object, error?: string}}
 */
function cleanAndParseJson(rawText, schema) {
  if (typeof rawText !== "string") {
    return { success: false, error: "LLM response was not text" };
  }
  const cleanJsonString = rawText.replace(/```json|```/gi, "").trim();
  try {
    const data = JSON.parse(cleanJsonString);
    validateResponse(data, schema);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: `Invalid LLM JSON response: ${error.message}` };
  }
}

function validateResponse(data, schema) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("response must be a JSON object");
  }
  for (const field of schema.required || []) {
    if (!(field in data)) throw new Error(`missing required field: ${field}`);
  }
  for (const [field, definition] of Object.entries(schema.properties || {})) {
    if (!(field in data)) continue;
    const value = data[field];
    if (value === null && definition.nullable) continue;
    const valid =
      (definition.type === "BOOLEAN" && typeof value === "boolean") ||
      ((definition.type === "NUMBER" || definition.type === "INTEGER")
        && typeof value === "number" && Number.isFinite(value)) ||
      (definition.type === "STRING" && typeof value === "string") ||
      (definition.type === "ARRAY" && Array.isArray(value) && value.every((item) => typeof item === "string"));
    if (!valid || (definition.enum && !definition.enum.includes(value))) {
      throw new Error(`invalid field: ${field}`);
    }
    if (typeof value === "number"
      && ((definition.minimum !== undefined && value < definition.minimum)
        || (definition.maximum !== undefined && value > definition.maximum))) {
      throw new Error(`out-of-range field: ${field}`);
    }
    if (definition.type === "INTEGER" && typeof value === "number" && !Number.isInteger(value)) {
      throw new Error(`field must be an integer: ${field}`);
    }
  }
}

function logProviderError(provider, error) {
  if (isAuthError(error)) {
    console.error("[ai-services] Provider API Key Error:", error.message);
  } else if (isNotFoundError(error)) {
    console.warn(`[ai-services] ${provider} model not found; skipping provider.`);
  } else {
    console.error(`[ai-services] ${provider} Error Detail:`, error);
  }
}

function isAuthError(error) {
  return [error?.status, error?.statusCode, error?.response?.status, error?.error?.status]
    .some((status) => status === 401 || status === 403);
}

function isNotFoundError(error) {
  return [error?.status, error?.statusCode, error?.response?.status, error?.error?.status]
    .some((status) => status === 404);
}

/**
 * Removes non-standard integer schema flags before sending schemas to Gemini.
 * @param {*} schema
 * @returns {*}
 */
function sanitizeSchema(schema) {
  if (Array.isArray(schema)) return schema.map(sanitizeSchema);
  if (!schema || typeof schema !== "object") return schema;
  const sanitized = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === "integer") continue;
    sanitized[key] = sanitizeSchema(value);
  }
  return sanitized;
}

module.exports = { runStructuredLlm, cleanAndParseJson, sanitizeSchema };
