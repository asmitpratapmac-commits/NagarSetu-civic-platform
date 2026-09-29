const ApiError = require('../utils/ApiError');

/**
 * Restricts a route to one or more roles. Must run after `protect`.
 * Usage: router.get('/admin-only', protect, authorize('admin'), handler)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Not authenticated.');
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not permitted to perform this action.`
      );
    }
    next();
  };
};

/**
 * Ensures an authority officer can only act on complaints assigned to them
 * (admins bypass this check). Expects `req.complaint` to already be loaded
 * by a preceding middleware/controller step, OR checks req.params.id lazily —
 * here we implement the common case where the complaint is attached to req.
 */
const ownsAssignment = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  if (req.user.role === 'authority') {
    const complaint = req.complaint;
    if (complaint && complaint.assignedTo && complaint.assignedTo.toString() === req.user._id.toString()) {
      return next();
    }
    throw ApiError.forbidden('You are not assigned to this complaint.');
  }
  throw ApiError.forbidden('Insufficient permissions.');
};

module.exports = { authorize, ownsAssignment };
