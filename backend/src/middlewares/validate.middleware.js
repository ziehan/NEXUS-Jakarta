const allowedStatuses = new Set([
  "Pending",
  "PENDING_AI",
  "Approved",
  "In_Progress",
  "Resolved",
  "Rejected",
]);
const allowedPriorities = new Set(["Low", "Medium", "High"]);

function sanitize(value) {
  if (typeof value === "string") return value.replace(/[<>]/g, "").trim();
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitize(item)]),
    );
  }
  return value;
}

function validateReportPayload(req, res, next) {
  req.body = sanitize(req.body);
  const reportSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    latitude: z.coerce.number().finite().min(-90).max(90),
    longitude: z.coerce.number().finite().min(-180).max(180),
  }).passthrough();
  const result = reportSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid report payload",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  req.body = result.data;
  const { latitude, longitude } = req.body;
  if (req.body.status && !allowedStatuses.has(req.body.status))
    return res.status(400).json({ error: "Invalid status" });
  if (req.body.priority && !allowedPriorities.has(req.body.priority))
    return res.status(400).json({ error: "Invalid priority" });
  if (
    latitude !== undefined &&
    (Number(latitude) < -90 || Number(latitude) > 90)
  )
    return res.status(400).json({ error: "Invalid latitude" });
  if (
    longitude !== undefined &&
    (Number(longitude) < -180 || Number(longitude) > 180)
  )
    return res.status(400).json({ error: "Invalid longitude" });
  if (latitude !== undefined) req.body.latitude = Number(latitude);
  if (longitude !== undefined) req.body.longitude = Number(longitude);
  return next();
}

module.exports = { validateReportPayload };
const { z } = require("zod");
