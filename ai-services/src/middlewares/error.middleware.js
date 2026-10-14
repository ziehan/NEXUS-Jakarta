/**
 * Converts all uncaught application errors into a safe, stable response.
 * @param {Error} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  if (status >= 500) console.error("[ai-services]", error.message);
  return res.status(status).json({
    success: false,
    error: status >= 500 ? "AI service temporarily unavailable" : error.message,
  });
}

module.exports = errorMiddleware;
