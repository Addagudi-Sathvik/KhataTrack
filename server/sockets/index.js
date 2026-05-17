import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function configureSockets(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing socket token'));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Invalid socket user'));
      socket.userId = user.id;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.on('join-budget-group', (groupId) => socket.join(`group:${groupId}`));
  });
}

export function emitToUser(req, event, payload) {
  req.app.get('io')?.to(`user:${req.user.id}`).emit(event, payload);
}
