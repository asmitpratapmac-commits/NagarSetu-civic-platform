require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const Settings = require('../models/Settings');
const logger = require('./logger');

const CITY_CENTER = { lat: 28.6139, lng: 77.209 }; // New Delhi — used as a realistic default

const jitter = (base, spread = 0.05) => base + (Math.random() - 0.5) * spread;

const DEPARTMENTS = [
  { name: 'Roads & Infrastructure', code: 'ROADS', categories: ['Pothole', 'Damaged Road', 'Public Property Damage'] },
  { name: 'Sanitation Department', code: 'SANITATION', categories: ['Garbage / Sanitation'] },
  { name: 'Electrical & Lighting', code: 'ELECTRICAL', categories: ['Streetlight'] },
  { name: 'Water Board', code: 'WATER', categories: ['Water Leakage', 'Water Supply', 'Drainage'] },
  { name: 'Traffic Management', code: 'TRAFFIC', categories: ['Traffic'] },
];

const CATEGORIES = Complaint.CATEGORY_ENUM;
const SEVERITIES = Complaint.SEVERITY_ENUM;
const STATUSES = ['Submitted', 'Assigned', 'In Progress', 'Pending Verification', 'Resolved'];

const SAMPLE_TITLES = {
  Pothole: ['Large pothole near market road', 'Deep pothole causing traffic slowdown'],
  'Damaged Road': ['Road surface completely broken', 'Cracked road after monsoon'],
  'Garbage / Sanitation': ['Garbage not collected for a week', 'Overflowing dustbin near park'],
  Streetlight: ['Streetlight not working for 10 days', 'Flickering streetlight, safety concern'],
  'Water Leakage': ['Major water pipeline leak', 'Water leaking onto main road'],
  'Water Supply': ['No water supply for 3 days', 'Irregular water supply timing'],
  Drainage: ['Blocked drainage causing waterlogging', 'Open drain overflowing'],
  Traffic: ['Traffic signal not working', 'Illegal parking blocking road'],
  'Public Property Damage': ['Damaged park bench', 'Broken bus stop shelter'],
  Other: ['Stray animal issue near school', 'Encroachment on footpath'],
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info('Connected to MongoDB for seeding.');

  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Complaint.deleteMany({}),
    Settings.deleteMany({}),
  ]);

  await Settings.create({ key: 'app_settings' });

  // -------- Departments --------
  const departments = await Department.insertMany(DEPARTMENTS);
  const deptByCode = Object.fromEntries(departments.map((d) => [d.code, d]));

  // -------- Users --------
  const passwordHash = await bcrypt.hash('Password@123', 12);

  const admin = await User.create({
    name: 'Aditi Sharma',
    email: 'admin@nagarsetu.ai',
    password: passwordHash,
    role: 'admin',
    isVerified: true,
    phone: '9876543210',
  });

  const officers = await User.insertMany(
    departments.map((dept, i) => ({
      name: `Officer ${['Rakesh', 'Meena', 'Suresh', 'Kavita', 'Arjun'][i]}`,
      email: `officer.${dept.code.toLowerCase()}@nagarsetu.ai`,
      password: passwordHash,
      role: 'authority',
      department: dept._id,
      designation: 'Field Officer',
      employeeId: `EMP-${1000 + i}`,
      isVerified: true,
      phone: `98765432${10 + i}`,
    }))
  );

  // Set department heads
  await Promise.all(
    departments.map((dept, i) => Department.findByIdAndUpdate(dept._id, { headOfDepartment: officers[i]._id }))
  );

  const citizens = await User.insertMany(
    Array.from({ length: 12 }).map((_, i) => ({
      name: `Citizen ${i + 1}`,
      email: `citizen${i + 1}@example.com`,
      password: passwordHash,
      role: 'citizen',
      isVerified: true,
      phone: `90000000${String(i).padStart(2, '0')}`,
    }))
  );

  // -------- Complaints --------
  const complaintsToCreate = 60;
  const complaints = [];

  for (let i = 0; i < complaintsToCreate; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1))]; // skip "Other" mostly
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const dept = departments.find((d) => d.categories.includes(category)) || departments[0];
    const officer = officers.find((o) => o.department.toString() === dept._id.toString());
    const citizen = citizens[Math.floor(Math.random() * citizens.length)];
    const titles = SAMPLE_TITLES[category] || SAMPLE_TITLES.Other;
    const daysAgo = Math.floor(Math.random() * 25);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const complaintData = {
      title: titles[Math.floor(Math.random() * titles.length)],
      description: `Reported civic issue related to ${category.toLowerCase()}. Requires attention from ${dept.name}.`,
      category,
      severity,
      status,
      department: dept._id,
      reportedBy: citizen._id,
      assignedTo: status !== 'Submitted' ? officer?._id : null,
      assignedAt: status !== 'Submitted' ? createdAt : null,
      address: `Sector ${Math.ceil(Math.random() * 40)}, Demo City`,
      location: {
        type: 'Point',
        coordinates: [jitter(CITY_CENTER.lng), jitter(CITY_CENTER.lat)],
      },
      createdAt,
      ai: {
        isAnalyzed: true,
        predictedCategory: category,
        predictedSeverity: severity,
        predictedDepartment: dept._id,
        confidence: Number((0.6 + Math.random() * 0.35).toFixed(2)),
        summary: `AI summary: ${category} issue of ${severity} severity.`,
        recommendedAction: `Dispatch ${dept.name} team to assess and resolve.`,
        analyzedAt: createdAt,
      },
      timeline: [{ status: 'Submitted', actorRole: 'citizen', note: 'Complaint submitted.', createdAt }],
    };

    if (status === 'Resolved') {
      complaintData.resolvedAt = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000);
      complaintData.resolvedBy = officer?._id;
      complaintData.resolutionNote = 'Issue resolved and verified on site.';
      complaintData.resolutionEvidence = [
        { url: 'https://picsum.photos/seed/before' + i + '/600/400', type: 'image' },
        { url: 'https://picsum.photos/seed/after' + i + '/600/400', type: 'image' },
      ];
      complaintData.verification = { isConfirmedByCitizen: true, confirmedAt: complaintData.resolvedAt };
    }

    complaints.push(complaintData);
  }

  await Complaint.insertMany(complaints);

  logger.info('✅ Seed complete:');
  logger.info(`   Admin login: admin@nagarsetu.ai / Password@123`);
  logger.info(`   Officer logins: officer.roads@nagarsetu.ai / Password@123 (and 4 more)`);
  logger.info(`   Citizen logins: citizen1@example.com / Password@123 (and 11 more)`);
  logger.info(`   Created ${departments.length} departments, ${officers.length} officers, ${citizens.length} citizens, ${complaints.length} complaints.`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  logger.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});
