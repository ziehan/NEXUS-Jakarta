const { runStructuredLlm } = require("./llmRunner");
const { planning } = require("../prompts/systemPrompts");

const schema = {
  type: "OBJECT",
  properties: {
    targetAgency: { type: "STRING" },
    agencyConfidence: { type: "NUMBER", minimum: 0, maximum: 1 },
    planConfidence: { type: "NUMBER", minimum: 0, maximum: 1 },
    confidenceScore: { type: "NUMBER", minimum: 0, maximum: 1 },
    estimatedDays: { type: "INTEGER", minimum: 0 },
    actionSteps: { type: "ARRAY", items: { type: "STRING" } },
    dispatchReason: { type: "STRING" },
  },
  required: [
    "targetAgency", "agencyConfidence", "planConfidence", "confidenceScore",
    "estimatedDays", "actionSteps", "dispatchReason",
  ],
};

const defaultValues = {
  targetAgency: "Pemeriksaan manual diperlukan",
  agencyConfidence: 0,
  planConfidence: 0,
  confidenceScore: 0,
  estimatedDays: 0,
  actionSteps: [],
  dispatchReason: "Rencana dispatch AI tidak tersedia; lakukan triase manual.",
};

/**
 * Creates a deterministic municipal dispatch recommendation.
 * @param {object} report
 * @returns {Promise<object>}
 */
async function createPlan(report) {
  const result = await runStructuredLlm(planning, report, schema, defaultValues);
  if (result.data && typeof result.data.agencyConfidence === "number"
    && typeof result.data.planConfidence === "number") {
    result.data.confidenceScore = Number((
      (result.data.agencyConfidence + result.data.planConfidence) / 2
    ).toFixed(4));
  }
  return result;
}

module.exports = createPlan;
