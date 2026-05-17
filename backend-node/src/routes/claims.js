import { Router } from 'express';
import { pool } from '../db.js';
import { requireLogin } from '../middleware/auth.js';

const router = Router();

router.post('/', requireLogin, async (req, res) => {
  const { item_id, fullName, email, phone, nid, proofDetails, additionalInfo } = req.body;

  if (!item_id || !fullName || !email || !phone || !proofDetails) {
    return res.status(400).json({ message: 'Required claim fields are missing' });
  }

  const [result] = await pool.execute(
    `INSERT INTO claims
     (item_id, claimant_id, full_name, email, phone, nid_or_passport, proof_details, additional_info)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [item_id, req.session.user.id, fullName, email, phone, nid || null, proofDetails, additionalInfo || null]
  );

  res.status(201).json({ id: result.insertId, message: 'Claim submitted' });
});

router.get('/mine', requireLogin, async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT c.*, i.title, i.item_type
     FROM claims c
     JOIN items i ON i.id = c.item_id
     WHERE c.claimant_id = ?
     ORDER BY c.created_at DESC`,
    [req.session.user.id]
  );

  res.json(rows);
});

export default router;

