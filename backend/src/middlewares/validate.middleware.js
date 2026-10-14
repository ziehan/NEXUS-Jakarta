const allowedStatuses = new Set([
  "Pending",
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
  const { title, description, category, latitude, longitude } = req.body;
  if (
    req.method === "POST" &&
    (!title ||
      !description ||
      !category ||
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude)))
  ) {
    return res
      .status(400)
      .json({
        error:
          "title, description, category, latitude, and longitude are required",
      });
  }
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
