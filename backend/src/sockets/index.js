import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as models from '../models/index.js';
import { notify } from '../services/notify.js';

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

    socket.on('conversation:join', (id) => {
      if (!id) return;
      socket.join(String(id));
    });

    socket.on('typing', (payload) => socket.to(String(payload.conversation_id)).emit('typing', payload));

    // Handle client sending a message over socket
    socket.on('message:send', async (payload, ack) => {
      try {
        if (!socket.user?.sub) throw new Error('Unauthenticated');
        const { conversationId, text } = payload || {};
        if (!conversationId || !text) throw new Error('Invalid payload');
        const Conversation = models.Conversation;
        const Message = models.Message;
        const conv = await Conversation.findById(conversationId);
        if (!conv) throw new Error('Conversation not found');
        // Verify membership
        const isParticipant = conv.participants.some((p) => String(p) === String(socket.user.sub));
        if (!isParticipant) throw new Error('Access denied');
        const message = await Message.create({ conversation: conv._id, sender: socket.user.sub, messageText: text });
        conv.lastMessage = text;
        conv.lastMessageAt = new Date();
        await conv.save();
        // Emit to room
        io.to(String(conv._id)).emit('message:new', {
          id: String(message._id),
          conversation_id: String(conv._id),
          sender_id: String(socket.user.sub),
          message_text: text,
          created_at: message.createdAt
        });
        // Notify other participant(s)
        const other = conv.participants.find((p) => String(p) !== String(socket.user.sub));
        if (other) {
          await notify(other, 'New message', 'You have a new message', `Chat.html?conversation_id=${conv._id}`, io);
        }
        if (typeof ack === 'function') ack({ success: true, id: String(message._id) });
      } catch (err) {
        if (typeof ack === 'function') ack({ success: false, message: err.message });
      }
    });

    socket.on('disconnect', () => {
      // cleanup if needed
    });
  });
}
