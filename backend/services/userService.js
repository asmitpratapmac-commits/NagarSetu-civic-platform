const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const listUsers = async ({ role, isActive, search, page = 1, limit = 20 }) => {
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(filter).populate('department', 'name code').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return { items, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
};

const getUserById = async (id) => {
  const user = await User.findById(id).populate('department', 'name code');
  if (!user) throw ApiError.notFound('User not found.');
  return user;
};

const setActiveStatus = async (id, isActive) => {
  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!user) throw ApiError.notFound('User not found.');
  return user;
};

const updateUserRole = async (id, role, department) => {
  if (!['citizen', 'authority', 'admin'].includes(role)) {
    throw ApiError.badRequest('Invalid role.');
  }
  const update = { role };
  if (role === 'authority') update.department = department || null;
  const user = await User.findByIdAndUpdate(id, update, { new: true });
  if (!user) throw ApiError.notFound('User not found.');
  return user;
};

const updateOwnProfile = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found.');
  return user;
};

const listAuthorityByDepartment = async (departmentId) => {
  return User.find({ role: 'authority', department: departmentId, isActive: true }).select(
    'name email designation'
  );
};

module.exports = {
  listUsers,
  getUserById,
  setActiveStatus,
  updateUserRole,
  updateOwnProfile,
  listAuthorityByDepartment,
};
