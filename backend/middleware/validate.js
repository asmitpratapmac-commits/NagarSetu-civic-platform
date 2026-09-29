const ApiError = require('../utils/ApiError');

/**
 * Validates req.body (or req.query) against a Zod schema.
 * On success, replaces the source with the parsed/coerced data.
 * Usage: router.post('/', validate(createComplaintSchema), controller)
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }
  req[source] = result.data;
  next();
};

module.exports = validate;
