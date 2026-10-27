const validateReport = require("../agents/intakeAgent");
const createPlan = require("../agents/planningAgent");
const verifyRepair = require("../agents/verificationAgent");

function missingFields(body, fields) {
  return fields.filter((field) => {
    const value = body?.[field];
    return value === undefined || value === null
      || (typeof value === "string" && !value.trim());
  });
}

function validationResponse(res, fields) {
  return res.status(200).json({
    success: false,
    fallbackUsed: false,
    usedProvider: "none",
    executionTimeMs: 0,
    error: `Missing required fields: ${fields.join(", ")}`,
    data: null,
  });
}

function controllerFailure(res, error, agentName) {
  console.error(`[ai-services] ${agentName} controller error:`, error);
  return res.status(200).json({
    success: false,
    fallbackUsed: true,
    usedProvider: "safe-default",
    executionTimeMs: 0,
    error: "AI service temporarily unavailable",
    data: null,
  });
}

/**
 * Handles Agent 1 intake and deduplication.
 */
async function validate(req, res) {
  const missing = missingFields(req.body, [
    "title", "description", "category", "locationAddress",
    "latitude", "longitude", "photoUrl", "existingReports",
  ]);
  if (missing.length) return validationResponse(res, missing);
  try {
    return res.status(200).json(await validateReport(req.body));
  } catch (error) { return controllerFailure(res, error, "Intake"); }
}

/**
 * Handles Agent 2 planning and dispatch.
 */
async function plan(req, res) {
  const missing = missingFields(req.body, [
    "reportId", "title", "description", "category", "locationAddress", "duplicateCount",
  ]);
  if (missing.length) return validationResponse(res, missing);
  try {
    return res.status(200).json(await createPlan(req.body));
  } catch (error) { return controllerFailure(res, error, "Planning"); }
}

/**
 * Handles Agent 3 visual verification and audit.
 */
async function verify(req, res) {
  const missing = missingFields(req.body, ["beforePhotoUrl", "afterPhotoUrl", "reportDescription"]);
  if (missing.length) return validationResponse(res, missing);
  try {
    return res.status(200).json(await verifyRepair(req.body));
  } catch (error) { return controllerFailure(res, error, "Verification"); }
}

module.exports = { validate, plan, verify };
