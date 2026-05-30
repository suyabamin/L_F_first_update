import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/http.js';

const router = Router();

// Start or get existing conversation for a post
router.post('/start', requireAuth, asyncHandler(async (req, res) => {
  const postId = req.body.postId || req.body.post_id || req.body.item_id;
  if (!postId) return res.status(422).json({ success: false, message: 'Missing postId.' });
  const post = await req.models.Post.findById(postId).select('user title');
  if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
  const ownerId = String(post.user);
  const userId = String(req.user._id);
  if (ownerId === userId) return res.status(422).json({ success: false, message: 'Cannot start conversation with yourself.' });
  const participants = [userId, ownerId].sort();
  let conversation = await req.models.Conversation.findOne({ post: postId, participants: { $all: participants, $size: 2 } });
  if (conversation) return ok(res, { conversation_id: String(conversation._id) });
  conversation = await req.models.Conversation.create({ post: postId, participants });
  return created(res, { conversation_id: String(conversation._id) });
}));

// List conversations for current user
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const rows = await req.models.Conversation.find({ participants: req.user._id }).populate('post', 'title').populate('participants', 'fullName avatarUrl').sort({ lastMessageAt: -1 });
  const conversations = await Promise.all(rows.map(async (c) => {
    const other = c.participants.find((p) => String(p._id) !== String(req.user._id));
    const unread = await req.models.Message.countDocuments({ conversation: c._id, isRead: false, sender: { $ne: req.user._id } });
    return {
      id: String(c._id),
      item_id: String(c.post?._id || ''),
      title: c.post?.title || 'Conversation',
      last_message: c.lastMessage || '',
      updated_at: c.lastMessageAt || c.updatedAt,
      other_name: other?.fullName || 'User',
      other_id: other ? String(other._id) : '',
      other_avatar: other?.avatarUrl || '',
      unread_count: unread
    };
  }));
  return ok(res, { conversations });
}));

// Get messages for a conversation
router.get('/:id/messages', requireAuth, asyncHandler(async (req, res) => {
  const conversation = await req.models.Conversation.findById(req.params.id);
  if (!conversation || !conversation.participants.some((id) => String(id) === String(req.user._id))) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  const messages = await req.models.Message.find({ conversation: conversation._id }).populate('sender', 'fullName avatarUrl').sort({ createdAt: 1 });
  await req.models.Message.updateMany({ conversation: conversation._id, sender: { $ne: req.user._id } }, { isRead: true });
  return ok(res, {
    currentUserId: String(req.user._id),
    messages: messages.map((m) => ({ id: String(m._id), sender_id: String(m.sender._id), full_name: m.sender.fullName, avatar: m.sender.avatarUrl || '', message_text: m.messageText, is_read: m.isRead, created_at: m.createdAt }))
  });
}));

export default router;
