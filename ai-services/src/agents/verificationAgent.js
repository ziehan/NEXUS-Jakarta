const { runStructuredLlm } = require("./llmRunner");
const { verification } = require("../prompts/systemPrompts");

const schema = {
  type: "OBJECT",
  properties: {
    isVerified: { type: "BOOLEAN" },
    verificationConfidence: { type: "NUMBER" },
    remarks: { type: "STRING" },
  },
  required: ["isVerified", "verificationConfidence", "remarks"],
};

/**
 * Verifies field repair evidence against the original report.
 * @param {object} evidence
 * @returns {Promise<object>}
 */
async function verifyRepair(evidence) {
  const missingFields = [
    "originalReport",
    "proofPhotoBase64",
    "officerNotes",
  ].filter(
    (field) =>
      !evidence ||
      evidence[field] === undefined ||
      evidence[field] === null ||
      (typeof evidence[field] === "string" && !evidence[field].trim()),
  );
  if (missingFields.length) {
    const error = new Error(
      `Missing required fields: ${missingFields.join(", ")}`,
    );
    error.statusCode = 400;
    throw error;
  }

  const cleanProofPhotoBase64 = evidence.proofPhotoBase64.replace(
    /^data:image\/\w+;base64,/,
    "",
  );
  const images = [
    {
      inlineData: { mimeType: "image/jpeg", data: cleanProofPhotoBase64 },
    },
  ];
  const { proofPhotoBase64, ...textEvidence } = evidence;
  return runStructuredLlm(verification, textEvidence, schema, images);
}

module.exports = verifyRepair;
