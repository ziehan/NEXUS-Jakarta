function errorMiddleware(error, req, res, next) {
  const statusCode =
    error.statusCode ||
    (error.code === "P2025" ? 404 : error.code === "P2002" ? 400 : 500);
  if (statusCode >= 500)
    console.error(`${req.method} ${req.originalUrl}`, error);
  if (error.code === "AI_SERVICE_DOWN") {
    return res.status(503).json({
      success: false,
      error: "AI Service Timeout or Unavailable",
      code: "AI_SERVICE_DOWN",
    });
  }

  return res.status(statusCode).json({
    success: false,
    message:
      error.code === "P2002"
        ? "A report with the same unique value already exists"
        : error.code === "P2025"
          ? "Report not found"
          : statusCode >= 500
            ? "Internal server error"
            : error.message,
  });
}

module.exports = errorMiddleware;
