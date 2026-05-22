import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function configureSockets(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.cookie?.match(/lf_token=([^;]+)/)?.[1];
      if (token) socket.user = jwt.verify(decodeURIComponent(token), env.jwtSecret);
    } catch {
      // Anonymous sockets can still connect for public events.
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.user?.sub) socket.join(String(socket.user.sub));
    socket.on('conversation:join', (id) => socket.join(String(id)));
    socket.on('typing', (payload) => socket.to(String(payload.conversation_id)).emit('typing', payload));
  });
}
