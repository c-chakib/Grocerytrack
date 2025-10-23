import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:4200',
        process.env.FRONTEND_URL || ''
      ].filter(Boolean),
      credentials: true
    }
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id, userId: socket.userId });
    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { socketId: socket.id });
    });
  });

  return io;
};

export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, {
    type: event,
    payload: data,
    timestamp: new Date().toISOString()
  });
};