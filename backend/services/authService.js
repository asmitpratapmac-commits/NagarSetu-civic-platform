const bcrypt = require('bcrypt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateTokenPair, verifyRefreshToken } = require('./tokenService');

const SALT_ROUNDS = 12;

const registerCitizen = async ({ name, email, phone, password, address }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    phone,
    address,
    password: hashedPassword,
    role: 'citizen',
  });

  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user: user.toSafeObject(), ...tokens };
};

/**
 * Used by Admin to create authority/admin accounts (not exposed on public register route).
 */
const createStaffUser = async ({ name, email, phone, password, role, department, designation, employeeId, jurisdictionArea }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists.');
  }
  if (!['authority', 'admin'].includes(role)) {
    throw ApiError.badRequest('Invalid staff role.');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
    department: department || null,
    designation,
    employeeId,
    jurisdictionArea,
    isVerified: true,
  });

  return user.toSafeObject();
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated. Contact support.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save();

  return { user: user.toSafeObject(), ...tokens };
};

const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token.');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Refresh token does not match. Please log in again.');
  }

  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return tokens;
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found.');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw ApiError.unauthorized('Current password is incorrect.');

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.refreshToken = null; // force re-login on other devices
  await user.save();
};

module.exports = {
  registerCitizen,
  createStaffUser,
  login,
  refreshAccessToken,
  logout,
  changePassword,
};
