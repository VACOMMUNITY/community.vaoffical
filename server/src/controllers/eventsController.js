import { query } from '../db/index.js';

export const getEvents = async (req, res) => {
  try {
    const result = await query('SELECT * FROM events ORDER BY event_date ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM events WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Workshop event not found.' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const registerForEvent = async (req, res) => {
  const { eventId, amount, paymentMethod } = req.body;
  if (!eventId) return res.status(400).json({ error: 'Event ID is required.' });

  try {
    const eventCheck = await query('SELECT title, seats_available FROM events WHERE id = $1', [eventId]);
    if (eventCheck.rows.length === 0) return res.status(404).json({ error: 'Workshop event not found.' });

    const event = eventCheck.rows[0];
    if (event.seats_available <= 0) return res.status(400).json({ error: 'This workshop is fully booked.' });

    // Check if already registered
    const exists = await query('SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2', [req.user.id, eventId]);
    if (exists.rows.length > 0) return res.status(400).json({ error: 'You are already registered for this event.' });

    const paymentId = `pay_${Date.now()}`;
    const registrationId = `reg_${Date.now()}`;

    // Insert payment log
    await query(
      `INSERT INTO payments (id, user_id, amount, payment_method, status, item_type, item_id, item_name)
       VALUES ($1, $2, $3, $4, 'success', 'event', $5, $6)`,
      [paymentId, req.user.id, amount || 0, paymentMethod || 'UPI', eventId, event.title]
    );

    // Insert registration
    const regResult = await query(
      `INSERT INTO registrations (id, user_id, event_id, payment_status, payment_id)
       VALUES ($1, $2, $3, 'completed', $4)
       RETURNING *`,
      [registrationId, req.user.id, eventId, paymentId]
    );

    // Deduct seat available
    await query('UPDATE events SET seats_available = seats_available - 1 WHERE id = $1', [eventId]);

    res.status(201).json({ registration: regResult.rows[0], message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const result = await query('SELECT * FROM registrations WHERE user_id = $1', [req.user.id]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelRegistration = async (req, res) => {
  const { id } = req.params; // registration id
  try {
    const regRes = await query('SELECT * FROM registrations WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (regRes.rows.length === 0) return res.status(404).json({ error: 'Registration record not found.' });

    const reg = regRes.rows[0];

    // Delete registration
    await query('DELETE FROM registrations WHERE id = $1', [id]);

    // Restore Event seat available
    await query('UPDATE events SET seats_available = seats_available + 1 WHERE id = $1', [reg.event_id]);

    // Mark associated payment refunded
    if (reg.payment_id) {
      await query("UPDATE payments SET status = 'refunded' WHERE id = $1", [reg.payment_id]);
    }

    res.status(200).json({ message: 'Registration successfully cancelled. Refund processed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin Operations
export const addEvent = async (req, res) => {
  const { title, description, date, time, venue, fees, seatsTotal, category, banner } = req.body;
  if (!title || !date) return res.status(400).json({ error: 'Workshop title and date are required.' });

  try {
    const newEventId = `evt_${Date.now()}`;
    const insertText = `
      INSERT INTO events (id, title, description, banner, event_date, event_time, venue, fees, seats_total, seats_available, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, $10)
      RETURNING *
    `;
    const result = await query(insertText, [
      newEventId, title, description || '', 
      banner || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
      date, time || '18:00 - 20:00', venue || 'Zoom', Number(fees) || 0, Number(seatsTotal) || 50, category || 'General'
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM events WHERE id = $1', [id]);
    res.status(200).json({ message: 'Event workshop removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEventAttendees = async (req, res) => {
  const { id } = req.params; // event id
  try {
    const result = await query(
      `SELECT r.id as reg_id, r.registered_at, u.name, u.email, u.phone 
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = $1`,
      [id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, venue, fees, seatsTotal, category, banner } = req.body;
  try {
    const queryText = `
      UPDATE events 
      SET title = $1, description = $2, banner = $3, event_date = $4, event_time = $5, venue = $6, fees = $7, seats_total = $8, category = $9
      WHERE id = $10
      RETURNING *
    `;
    const result = await query(queryText, [title, description, banner, date, time, venue, Number(fees), Number(seatsTotal), category, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found.' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
