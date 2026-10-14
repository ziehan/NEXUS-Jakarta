const validateReport = require("../agents/intakeAgent");
const createPlan = require("../agents/planningAgent");
const verifyRepair = require("../agents/verificationAgent");

function requireFields(body, fields) {
  const missing = fields.filter(
    (field) => typeof body[field] !== "string" || !body[field].trim(),
  );
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
}

/**
 * Handles SCRUM-1 report validation.
 */
async function validate(req, res, next) {
  try {
    requireFields(req.body, ["title", "description", "location"]);
    return res.json({ success: true, data: await validateReport(req.body) });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles SCRUM-2 dispatch planning.
 */
async function plan(req, res, next) {
  try {
    requireFields(req.body, [
      "reportId",
      "title",
      "description",
      "category",
      "location",
    ]);
    return res.json({ success: true, data: await createPlan(req.body) });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles SCRUM-9 field verification.
 */
async function verify(req, res, next) {
  try {
    const missing = [
      "originalReport",
      "proofPhotoBase64",
      "officerNotes",
    ].filter(
      (field) =>
        req.body[field] === undefined ||
        req.body[field] === null ||
        (typeof req.body[field] === "string" && !req.body[field].trim()),
    );
    if (missing.length) {
      const error = new Error(`Missing required fields: ${missing.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }
    if (
      typeof req.body.originalReport !== "object" ||
      Array.isArray(req.body.originalReport)
    ) {
      const error = new Error("originalReport must be an object");
      error.statusCode = 400;
      throw error;
    }
    return res.json({ success: true, data: await verifyRepair(req.body) });
  } catch (error) {
    return next(error);
  }
}

module.exports = { validate, plan, verify };
