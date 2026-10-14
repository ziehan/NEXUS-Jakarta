function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || (error.code === "P2025" ? 404 : 500);
  if (statusCode >= 500)
    console.error(`${req.method} ${req.originalUrl}`, error);
  res.status(statusCode).json({
    error: statusCode >= 500 ? "Internal server error" : error.message,
  });
}

module.exports = errorMiddleware;
