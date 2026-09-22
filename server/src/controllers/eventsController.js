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
  const { 
    eventId, 
    amount, 
    paymentMethod,
    fullName,
    email,
    phone,
    collegeName,
    branch,
    year,
    selectedTier,
    paymentScreenshot
  } = req.body;

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
    const studentName = fullName || req.user.name || 'Student';
    const studentEmail = email || req.user.email || '';
    const studentPhone = phone || req.user.phone || '';

    // Insert payment log
    await query(
      `INSERT INTO payments (id, user_id, amount, payment_method, status, item_type, item_id, item_name)
       VALUES ($1, $2, $3, $4, 'pending', 'event', $5, $6)`,
      [paymentId, req.user.id, amount || 0, paymentMethod || 'UPI QR', eventId, event.title]
    );

    // Insert registration with student details and payment screenshot
    const regResult = await query(
      `INSERT INTO registrations (
        id, user_id, event_id, payment_status, payment_id,
        full_name, email, phone, college_name, branch, year,
        selected_tier, amount_paid, payment_screenshot, status
      ) VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
       RETURNING *`,
      [
        registrationId, req.user.id, eventId, paymentId,
        studentName, studentEmail, studentPhone, collegeName || '',
        branch || '', year || '', selectedTier || 'Regular',
        Number(amount) || 0, paymentScreenshot || '',
      ]
    );

    res.status(201).json({ 
      registration: regResult.rows[0], 
      message: 'Registration submitted successfully! Pending admin verification.' 
    });
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
  const { title, description, date, time, venue, fees, feesTier, qrCode, deadline, seatsTotal, category, banner } = req.body;
  if (!title || !date) return res.status(400).json({ error: 'Workshop title and date are required.' });

  try {
    const newEventId = `evt_${Date.now()}`;
    const insertText = `
      INSERT INTO events (id, title, description, banner, event_date, event_time, venue, fees, fees_tier, qr_code, deadline, seats_total, seats_available, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $13)
      RETURNING *
    `;
    const result = await query(insertText, [
      newEventId, title, description || '', 
      banner || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
      date, time || '18:00 - 20:00', venue || 'Zoom', 
      Number(fees) || 0,
      JSON.stringify(feesTier || {}),
      qrCode || '',
      deadline || '',
      Number(seatsTotal) || 50,
      category || 'Career Prep'
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
  const { title, description, date, time, venue, fees, feesTier, qrCode, deadline, seatsTotal, category, banner } = req.body;
  try {
    const queryText = `
      UPDATE events 
      SET title = $1, description = $2, banner = $3, event_date = $4, event_time = $5, venue = $6, fees = $7, 
          fees_tier = $8, qr_code = $9, deadline = $10, seats_total = $11, category = $12
      WHERE id = $13
      RETURNING *
    `;
    const result = await query(queryText, [
      title, description, banner, date, time, venue, 
      Number(fees), JSON.stringify(feesTier || {}), qrCode || '', deadline || '', 
      Number(seatsTotal), category, id
    ]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found.' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEventRegistrations = async (req, res) => {
  const { id } = req.params; // specific eventId or 'all'
  try {
    let result;
    if (id && id !== 'all') {
      result = await query(
        `SELECT r.*, e.title as event_title, e.event_date, e.event_time, e.venue 
         FROM registrations r
         LEFT JOIN events e ON r.event_id = e.id
         WHERE r.event_id = $1
         ORDER BY r.registered_at DESC`,
        [id]
      );
    } else {
      result = await query(
        `SELECT r.*, e.title as event_title, e.event_date, e.event_time, e.venue 
         FROM registrations r
         LEFT JOIN events e ON r.event_id = e.id
         ORDER BY r.registered_at DESC`
      );
    }
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRegistrationStatus = async (req, res) => {
  const { id } = req.params; // registrationId
  const { status } = req.body; // 'approved' | 'rejected'
  if (status !== 'approved' && status !== 'rejected' && status !== 'pending') {
    return res.status(400).json({ error: 'Status must be approved, rejected, or pending.' });
  }

  try {
    const regCheck = await query('SELECT * FROM registrations WHERE id = $1', [id]);
    if (regCheck.rows.length === 0) return res.status(404).json({ error: 'Registration not found.' });
    const reg = regCheck.rows[0];

    const updated = await query(
      `UPDATE registrations 
       SET status = $1, payment_status = $2 
       WHERE id = $3 
       RETURNING *`,
      [status, status === 'approved' ? 'completed' : (status === 'rejected' ? 'rejected' : 'pending'), id]
    );

    // If status changed to approved, deduct seat; if rejected and was approved, restore seat
    if (status === 'approved' && reg.status !== 'approved') {
      await query('UPDATE events SET seats_available = MAX(0, seats_available - 1) WHERE id = $1', [reg.event_id]);
      if (reg.payment_id) {
        await query("UPDATE payments SET status = 'success' WHERE id = $1", [reg.payment_id]);
      }
    } else if (status === 'rejected' && reg.status === 'approved') {
      await query('UPDATE events SET seats_available = seats_available + 1 WHERE id = $1', [reg.event_id]);
      if (reg.payment_id) {
        await query("UPDATE payments SET status = 'rejected' WHERE id = $1", [reg.payment_id]);
      }
    }

    res.status(200).json({ 
      registration: updated.rows[0], 
      message: `Registration marked as ${status}.` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
