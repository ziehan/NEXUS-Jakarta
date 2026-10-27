const { runStructuredLlm } = require("./llmRunner");
const { intake } = require("../prompts/systemPrompts");

const schema = {
  type: "OBJECT",
  properties: {
    isValid: { type: "BOOLEAN" },
    validityConfidence: { type: "NUMBER", minimum: 0, maximum: 1 },
    isDuplicate: { type: "BOOLEAN" },
    deduplicationConfidence: { type: "NUMBER", minimum: 0, maximum: 1 },
    parentReportId: { type: "STRING", nullable: true },
    priorityScore: { type: "INTEGER", minimum: 1, maximum: 100 },
    urgencyLevel: { type: "STRING", enum: ["Low", "Medium", "High", "Critical"] },
    category: { type: "STRING" },
    reasoning: { type: "STRING" },
  },
  required: [
    "isValid", "validityConfidence", "isDuplicate", "deduplicationConfidence",
    "parentReportId", "priorityScore", "urgencyLevel", "category", "reasoning",
  ],
};

const defaultValues = {
  isValid: false,
  validityConfidence: 0,
  isDuplicate: false,
  deduplicationConfidence: 0,
  parentReportId: null,
  priorityScore: 1,
  urgencyLevel: "Low",
  category: "Tidak diketahui",
  reasoning: "Analisis AI tidak tersedia; laporan memerlukan pemeriksaan manual.",
};

/**
 * Analyzes report relevance, spatial proximity, and semantic duplication.
 * @param {object} report
 * @returns {Promise<object>}
 */
async function validateReport(report) {
  return runStructuredLlm(intake, report, schema, defaultValues);
}

module.exports = validateReport;
