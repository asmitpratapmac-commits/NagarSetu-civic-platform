const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User');

/**
 * Initializes Socket.IO on the given HTTP server. Every connecting client must
 * present a valid JWT access token (same one used for REST auth) via the
 * `auth.token` handshake field. On success the socket joins:
 *   - `user:<id>`      — for targeted per-user notifications
 *   - `role:<role>`    — for role-wide broadcasts (e.g. announcements)
 *   - `all-users`      — for global broadcasts
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required.'));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) return next(new Error('Invalid or inactive user.'));

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Authentication failed.'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.join(`role:${socket.userRole}`);
    socket.join('all-users');

    logger.info(`Socket connected: user=${socket.userId} role=${socket.userRole}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user=${socket.userId}`);
    });
  });

  return io;
};

module.exports = initSocket;
