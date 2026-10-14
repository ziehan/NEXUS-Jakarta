const { runStructuredLlm } = require("./llmRunner");
const { intake } = require("../prompts/systemPrompts");

const schema = {
  type: "OBJECT",
  properties: {
    isValid: { type: "BOOLEAN" },
    category: { type: "STRING" },
    urgency: { type: "STRING", enum: ["Low", "Medium", "High"] },
    confidenceScore: { type: "NUMBER" },
    rejectionReason: { type: "STRING" },
  },
  required: ["isValid", "category", "urgency", "confidenceScore"],
};

/**
 * Validates a citizen infrastructure report with a multimodal LLM.
 * @param {object} report
 * @returns {Promise<object>}
 */
async function validateReport(report) {
  const images = report.imageBase64
    ? [
        {
          inlineData: { mimeType: "image/jpeg", data: report.imageBase64 },
        },
      ]
    : [];
  const { imageBase64, ...textReport } = report;
  return runStructuredLlm(intake, textReport, schema, images);
}

module.exports = validateReport;
