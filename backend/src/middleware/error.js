export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production' ? 'Server error' : err.message;
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message });
}
