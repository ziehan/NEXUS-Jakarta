/**
 * Converts all uncaught application errors into a safe, stable response.
 * @param {Error} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error("[ai-services] Unhandled request error:", error);
  return res.status(200).json({
    success: false,
    fallbackUsed: true,
    usedProvider: "safe-default",
    executionTimeMs: 0,
    error: "AI service temporarily unavailable",
    data: null,
  });
}

module.exports = errorMiddleware;
