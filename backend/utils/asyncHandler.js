/**
 * Wraps an async route handler so any thrown/rejected error is forwarded to next(),
 * where the global error handler middleware turns it into a proper JSON response.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
