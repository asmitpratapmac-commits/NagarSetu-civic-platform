console.log("SERVER.JS STARTED");
process.on('exit', (code) => {
  console.log('PROCESS EXITED WITH CODE:', code);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

require('dotenv').config();

console.log("1 - before db");
const connectDB = require('./config/db');
console.log("2 - db loaded");

console.log("3 - before logger");
const logger = require('./utils/logger');
console.log("4 - logger loaded");

console.log("5 - before socket");
const initSocket = require('./sockets');
console.log("6 - socket loaded");

console.log("7 - before errorHandler");
const { notFound, errorHandler } = require('./middleware/errorHandler');
console.log("8 - errorHandler loaded");

console.log("9 - before rateLimiter");
const { apiLimiter } = require('./middleware/rateLimiter');
console.log("10 - rateLimiter loaded");

console.log("11 - before slaService");
const slaService = require('./services/slaService');
console.log("12 - slaService loaded");

const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');

// const connectDB = require('./config/db');
// const logger = require('./utils/logger');
// const initSocket = require('./sockets');
// const { notFound, errorHandler } = require('./middleware/errorHandler');
// const { apiLimiter } = require('./middleware/rateLimiter');
// const slaService = require('./services/slaService');

// -------- Routes --------




// -------- Routes --------
console.log("13 - before authRoutes");
const authRoutes = require('./routes/authRoutes');
console.log("14 - authRoutes loaded");

console.log("15 - before userRoutes");
const userRoutes = require('./routes/userRoutes');
console.log("16 - userRoutes loaded");

console.log("17 - before complaintRoutes");
const complaintRoutes = require('./routes/complaintRoutes');
console.log("18 - complaintRoutes loaded");

console.log("19 - before departmentRoutes");
const departmentRoutes = require('./routes/departmentRoutes');
console.log("20 - departmentRoutes loaded");

console.log("21 - before notificationRoutes");
const notificationRoutes = require('./routes/notificationRoutes');
console.log("22 - notificationRoutes loaded");

console.log("23 - before announcementRoutes");
const announcementRoutes = require('./routes/announcementRoutes');
console.log("24 - announcementRoutes loaded");

console.log("25 - before settingsRoutes");
const settingsRoutes = require('./routes/settingsRoutes');
console.log("26 - settingsRoutes loaded");

console.log("27 - before analyticsRoutes");
const analyticsRoutes = require('./routes/analyticsRoutes');
console.log("28 - analyticsRoutes loaded");

console.log("29 - before aiRoutes");
const aiRoutes = require('./routes/aiRoutes');
console.log("30 - aiRoutes loaded");

console.log("31 - before auditLogRoutes");
const auditLogRoutes = require('./routes/auditLogRoutes');
console.log("32 - auditLogRoutes loaded");



// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const complaintRoutes = require('./routes/complaintRoutes');
// const departmentRoutes = require('./routes/departmentRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const announcementRoutes = require('./routes/announcementRoutes');
// const settingsRoutes = require('./routes/settingsRoutes');
// const analyticsRoutes = require('./routes/analyticsRoutes');
// const aiRoutes = require('./routes/aiRoutes');
// const auditLogRoutes = require('./routes/auditLogRoutes');

const app = express();
const httpServer = http.createServer(app);

// -------- Core middleware --------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize()); // strips $ and . operators from req.body/query/params
app.use(xss()); // sanitizes user input against XSS

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use('/api', apiLimiter);

// -------- Attach Socket.IO instance to every request --------
const io = initSocket(httpServer);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// -------- Health check --------
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NagarSetu AI backend is running.', timestamp: new Date().toISOString() });
});

// -------- Mount routes --------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// -------- 404 + error handling (must be last) --------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5006;

// const start = async () => {
//   await connectDB();

//   httpServer.listen(PORT, () => {
//     logger.info(`NagarSetu AI backend listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
//   });

//   // Periodic SLA sweep: flags overdue complaints and auto-escalates them.
//   const SLA_SWEEP_INTERVAL_MS = Number(process.env.SLA_SWEEP_INTERVAL_MS || 15 * 60 * 1000);
//   setInterval(() => {
//     slaService.runSlaSweep(io).catch((err) => logger.error(`SLA sweep failed: ${err.message}`));
//   }, SLA_SWEEP_INTERVAL_MS);
// };


const start = async () => {
  console.log('START 1: Connecting to MongoDB...');

  await connectDB();

  console.log('START 2: MongoDB connected');

  httpServer.listen(PORT, () => {
    console.log(`START 3: Server listening on port ${PORT}`);

    logger.info(
      `NagarSetu AI backend listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`
    );
  });

  console.log('START 4: listen() called');

  const SLA_SWEEP_INTERVAL_MS = Number(
    process.env.SLA_SWEEP_INTERVAL_MS || 15 * 60 * 1000
  );

  setInterval(() => {
    slaService
      .runSlaSweep(io)
      .catch((err) => logger.error(`SLA sweep failed: ${err.message}`));
  }, SLA_SWEEP_INTERVAL_MS);

  console.log('START 5: SLA interval created');
};



start();

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = { app, httpServer, io };
