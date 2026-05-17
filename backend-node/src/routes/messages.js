import { Router } from 'express';
import { pool } from '../db.js';
import { requireLogin } from '../middleware/auth.js';

const router = Router();

router.post('/', requireLogin, async (req, res) => {
  const { item_id, receiver_id, message } = req.body;

  if (!item_id || !receiver_id || !message) {
    return res.status(400).json({ message: 'Invalid message data' });
  }

  const ownerId = Math.min(req.session.user.id, Number(receiver_id));
  const participantId = Math.max(req.session.user.id, Number(receiver_id));

  await pool.execute(
    `INSERT INTO conversations (item_id, owner_id, participant_id)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
    [item_id, ownerId, participantId]
  );

  const [convs] = await pool.execute(
    'SELECT id FROM conversations WHERE item_id = ? AND owner_id = ? AND participant_id = ?',
    [item_id, ownerId, participantId]
  );

  const conversationId = convs[0].id;
  await pool.execute(
    'INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)',
    [conversationId, req.session.user.id, message]
  );

  res.status(201).json({ conversation_id: conversationId, message: 'Message sent' });
});

router.get('/conversations', requireLogin, async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT c.*, i.title,
      (SELECT message_text FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message
     FROM conversations c
     JOIN items i ON i.id = c.item_id
     WHERE c.owner_id = ? OR c.participant_id = ?
     ORDER BY c.updated_at DESC`,
    [req.session.user.id, req.session.user.id]
  );

  res.json(rows);
});

router.get('/conversations/:id', requireLogin, async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT m.*, u.full_name
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = ?
     ORDER BY m.created_at ASC`,
    [req.params.id]
  );

  res.json(rows);
});

export default router;

