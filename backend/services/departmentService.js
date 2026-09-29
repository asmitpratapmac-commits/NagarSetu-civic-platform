const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const ApiError = require('../utils/ApiError');

const createDepartment = async (data) => {
  const existing = await Department.findOne({ $or: [{ name: data.name }, { code: data.code }] });
  if (existing) throw ApiError.conflict('A department with this name or code already exists.');
  return Department.create(data);
};

const updateDepartment = async (id, data) => {
  const department = await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!department) throw ApiError.notFound('Department not found.');
  return department;
};

const deleteDepartment = async (id) => {
  const inUse = await Complaint.countDocuments({ department: id, status: { $nin: ['Resolved', 'Rejected'] } });
  if (inUse > 0) {
    throw ApiError.badRequest('Cannot delete a department with active complaints. Reassign them first.');
  }
  const department = await Department.findByIdAndDelete(id);
  if (!department) throw ApiError.notFound('Department not found.');
  return department;
};

const listDepartments = async () => {
  return Department.find().populate('headOfDepartment', 'name email');
};

const getDepartmentById = async (id) => {
  const department = await Department.findById(id).populate('headOfDepartment', 'name email');
  if (!department) throw ApiError.notFound('Department not found.');
  return department;
};

/**
 * Recomputes the denormalized performance snapshot for a department from live Complaint data.
 * Run on-demand from the admin analytics view, or on a schedule.
 */
const refreshDepartmentPerformance = async (id) => {
  const [totalAssigned, totalResolved, overdueCount, avgAgg] = await Promise.all([
    Complaint.countDocuments({ department: id }),
    Complaint.countDocuments({ department: id, status: 'Resolved' }),
    Complaint.countDocuments({ department: id, isOverdue: true, status: { $nin: ['Resolved', 'Rejected'] } }),
    Complaint.aggregate([
      { $match: { department: id, status: 'Resolved', resolvedAt: { $ne: null } } },
      {
        $project: {
          hours: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60] },
        },
      },
      { $group: { _id: null, avgHours: { $avg: '$hours' } } },
    ]),
  ]);

  const avgResolutionHours = avgAgg[0] ? Math.round(avgAgg[0].avgHours) : 0;

  return Department.findByIdAndUpdate(
    id,
    {
      performance: { totalAssigned, totalResolved, avgResolutionHours, overdueCount },
    },
    { new: true }
  );
};

module.exports = {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  listDepartments,
  getDepartmentById,
  refreshDepartmentPerformance,
};
