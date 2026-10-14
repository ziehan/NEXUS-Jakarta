const { runStructuredLlm } = require("./llmRunner");
const { planning } = require("../prompts/systemPrompts");

const schema = {
  type: "OBJECT",
  properties: {
    targetAgency: { type: "STRING" },
    estimatedDays: { type: "STRING" },
    priority: { type: "STRING", enum: ["Low", "Medium", "High"] },
    actionSteps: { type: "ARRAY", items: { type: "STRING" } },
    confidenceScore: { type: "NUMBER" },
  },
  required: [
    "targetAgency",
    "estimatedDays",
    "priority",
    "actionSteps",
    "confidenceScore",
  ],
};

/**
 * Produces a municipal dispatch plan from a validated report.
 * @param {object} report
 * @returns {Promise<object>}
 */
async function createPlan(report) {
  return runStructuredLlm(planning, report, schema);
}

module.exports = createPlan;
