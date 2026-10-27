const { runStructuredLlm } = require("./llmRunner");
const { verification } = require("../prompts/systemPrompts");

const schema = {
  type: "OBJECT",
  properties: {
    isResolved: { type: "BOOLEAN" },
    verificationConfidence: { type: "NUMBER", minimum: 0, maximum: 1 },
    auditNotes: { type: "STRING" },
    visualMatch: { type: "BOOLEAN" },
  },
  required: ["isResolved", "verificationConfidence", "auditNotes", "visualMatch"],
};

const defaultValues = {
  isResolved: false,
  verificationConfidence: 0,
  auditNotes: "Bukti visual tidak dapat diaudit oleh AI; verifikasi manual diperlukan.",
  visualMatch: false,
};

/**
 * Compares before and after repair evidence using multimodal providers.
 * @param {object} evidence
 * @returns {Promise<object>}
 */
async function verifyRepair(evidence) {
  const images = [];
  for (const url of [evidence.beforePhotoUrl, evidence.afterPhotoUrl]) {
    if (url) images.push({ fileData: { fileUri: url, mimeType: "image/jpeg" } });
  }
  return runStructuredLlm(verification, evidence, schema, defaultValues, images);
}

module.exports = verifyRepair;
