import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/stats', requireAdmin, async (_req, res) => {
  const [[users]] = await pool.execute('SELECT COUNT(*) AS total FROM users');
  const [[items]] = await pool.execute('SELECT COUNT(*) AS total FROM items WHERE status <> "removed"');
  const [[reports]] = await pool.execute('SELECT COUNT(*) AS total FROM reports WHERE status = "open"');
  const [[returned]] = await pool.execute('SELECT COUNT(*) AS total FROM items WHERE status = "returned"');

  res.json({
    users: users.total,
    items: items.total,
    open_reports: reports.total,
    returned_items: returned.total
  });
});

router.patch('/items/:id/remove', requireAdmin, async (req, res) => {
  await pool.execute('UPDATE items SET status = "removed" WHERE id = ?', [req.params.id]);
  res.json({ message: 'Item removed' });
});

router.patch('/claims/:id', requireAdmin, async (req, res) => {
  const status = ['approved', 'rejected'].includes(req.body.status) ? req.body.status : 'pending';
  await pool.execute(
    'UPDATE claims SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
    [status, req.session.user.id, req.params.id]
  );
  res.json({ message: 'Claim updated' });
});

export default router;

