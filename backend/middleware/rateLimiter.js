const rateLimit = require('express-rate-limit');

/**
 * General API limiter — applied globally.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

/**
 * Stricter limiter for auth routes (login/register/refresh) to slow down brute force attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again in 15 minutes.',
  },
});

/**
 * Looser limiter for complaint creation to prevent spam while allowing legitimate reporting.
 */
const complaintCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many complaints submitted. Please try again later.',
  },
});

module.exports = { apiLimiter, authLimiter, complaintCreationLimiter };
