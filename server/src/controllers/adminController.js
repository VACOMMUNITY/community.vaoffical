import { query } from '../db/index.js';

export const getAllUsers = async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, phone, role, profile_photo, bio, registered_at, is_blocked FROM users ORDER BY registered_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleBlockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userRes = await query('SELECT is_blocked FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    const newBlockedState = !userRes.rows[0].is_blocked;
    await query('UPDATE users SET is_blocked = $1 WHERE id = $2', [newBlockedState, id]);
    res.status(200).json({ isBlocked: newBlockedState, message: 'User block state toggled.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (role !== 'admin' && role !== 'user') return res.status(400).json({ error: 'Invalid role assignment.' });

  try {
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    res.status(200).json({ role, message: 'User role changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.status(200).json({ message: 'User account removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, u.name as user_name, u.email as user_email 
       FROM payments p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.date DESC`
    );
    // Format column names to fit frontend camelCase expectations
    const formatted = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name || 'Removed User',
      userEmail: row.user_email || 'Removed Email',
      amount: parseFloat(row.amount),
      paymentMethod: row.payment_method,
      status: row.status,
      date: row.date,
      itemType: row.item_type,
      itemId: row.item_id,
      itemName: row.item_name
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const refundPayment = async (req, res) => {
  const { id } = req.params; // paymentId
  try {
    const payRes = await query('SELECT * FROM payments WHERE id = $1', [id]);
    if (payRes.rows.length === 0) return res.status(404).json({ error: 'Payment record not found.' });
    const payment = payRes.rows[0];

    // Toggle status to refunded
    await query("UPDATE payments SET status = 'refunded' WHERE id = $1", [id]);

    if (payment.item_type === 'event') {
      // Remove event registration
      await query('DELETE FROM registrations WHERE event_id = $1 AND user_id = $2', [payment.item_id, payment.user_id]);
      // Increment seats back
      await query('UPDATE events SET seats_available = seats_available + 1 WHERE id = $1', [payment.item_id]);
    } else {
      // Remove course enrollment
      await query('DELETE FROM enrollments WHERE course_id = $1 AND user_id = $2', [payment.item_id, payment.user_id]);
    }

    res.status(200).json({ message: 'Transaction refunded successfully. Permissions revoked.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
