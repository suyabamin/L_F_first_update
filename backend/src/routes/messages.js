import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/http.js';
import { conversationKey } from '../services/normalize.js';
import { notify } from '../services/notify.js';

const router = Router();

const sendMessageHandler = asyncHandler(async (req, res) => {
  const postId = req.body.item_id || req.body.post_id || req.body.item_id;
  const receiverId = req.body.receiver_id || req.body.receiverId || req.body.receiver;
  const text = req.body.message || req.body.messageText || req.body.text;
  if (!postId || !receiverId || !text) return res.status(422).json({ success: false, message: 'Invalid message data.' });
  const participants = conversationKey([req.user._id, receiverId]);
  let conversation = await req.models.Conversation.findOne({ post: postId, participants: { $all: participants, $size: 2 } });
  if (!conversation) conversation = await req.models.Conversation.create({ post: postId, participants });
  const message = await req.models.Message.create({ conversation: conversation._id, sender: req.user._id, messageText: text });
  conversation.lastMessage = text;
  conversation.lastMessageAt = new Date();
  await conversation.save();
  await notify(receiverId, 'New message', 'You have a new message about a listing.', `Chat.html?conversation_id=${conversation._id}&item_id=${postId}&receiver_id=${req.user._id}`, req.io);
  req.io?.to(String(conversation._id)).emit('message:new', {
    id: String(message._id),
    conversation_id: String(conversation._id),
    sender_id: String(req.user._id),
    message_text: text,
    created_at: message.createdAt
  });
  return created(res, { conversation_id: String(conversation._id), redirect: `Chat.html?conversation_id=${conversation._id}&item_id=${postId}&receiver_id=${receiverId}` });
});

router.post('/', requireAuth, sendMessageHandler);
router.post('/send', requireAuth, sendMessageHandler);

router.get('/conversations', requireAuth, asyncHandler(async (req, res) => {
  const rows = await req.models.Conversation.find({ participants: req.user._id }).populate('post', 'title').populate('participants', 'fullName').sort({ updatedAt: -1 });
  const conversations = rows.map((c) => {
    const other = c.participants.find((p) => String(p._id) !== String(req.user._id));
    return {
      id: String(c._id),
      item_id: String(c.post?._id || ''),
      title: c.post?.title || 'Conversation',
      last_message: c.lastMessage || '',
      updated_at: c.updatedAt,
      other_name: other?.fullName || 'User',
      other_id: other ? String(other._id) : ''
    };
  });
  return ok(res, { conversations });
}));

router.get('/conversations/:id', requireAuth, asyncHandler(async (req, res) => {
  const conversation = await req.models.Conversation.findById(req.params.id);
  if (!conversation || !conversation.participants.some((id) => String(id) === String(req.user._id))) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  const messages = await req.models.Message.find({ conversation: conversation._id }).populate('sender', 'fullName').sort({ createdAt: 1 });
  await req.models.Message.updateMany({ conversation: conversation._id, sender: { $ne: req.user._id } }, { isRead: true });
  return ok(res, {
    currentUserId: String(req.user._id),
    messages: messages.map((m) => ({
      id: String(m._id),
      sender_id: String(m.sender._id),
      full_name: m.sender.fullName,
      message_text: m.messageText,
      is_read: m.isRead,
      created_at: m.createdAt
    }))
  });
}));

export default router;
