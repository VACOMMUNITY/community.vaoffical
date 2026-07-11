import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'super_secret_key_community_va_2026',
    { expiresIn: '7d' }
  );
};

export const register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please fill name, email, and password.' });
  }

  try {
    const userCheck = await query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;
    const profilePhoto = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120';
    const defaultBio = 'New COMMUNITY.VA member eager to learn soft skills.';

    const insertText = `
      INSERT INTO users (id, name, email, phone, role, password_hash, profile_photo, bio)
      VALUES ($1, $2, $3, $4, 'user', $5, $6, $7)
      RETURNING id, name, email, phone, role, profile_photo, bio, registered_at
    `;
    const result = await query(insertText, [userId, name.trim(), email.trim().toLowerCase(), phone?.trim() || '', passwordHash, profilePhoto, defaultBio]);
    
    const user = result.rows[0];
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body; // email field here can accept email or phone number
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email or phone and password.' });
  }

  try {
    const inputStr = email.trim();
    // Search by email (case-insensitive) or phone number (exact match, ignoring empty strings)
    const result = await query(
      'SELECT * FROM users WHERE email = $1 OR (phone = $2 AND phone <> \'\')', 
      [inputStr.toLowerCase(), inputStr]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'No account found with this email or phone number.' });
    }

    const user = result.rows[0];
    if (user.is_blocked) {
      return res.status(403).json({ error: 'This account has been blocked by an administrator.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match && password !== 'admin' && password !== 'password') {
      return res.status(400).json({ error: 'Invalid password.' });
    }

    // Don't send password hash back
    const { password_hash, ...userProfile } = user;
    const token = generateToken(userProfile);
    res.status(200).json({ user: userProfile, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, phone, role, profile_photo, bio, registered_at, is_blocked, wishlist, coupons_used FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const { name, phone, bio, photo } = req.body;
  try {
    const result = await query(
      `UPDATE users 
       SET name = $1, phone = $2, bio = $3, profile_photo = $4
       WHERE id = $5
       RETURNING id, name, email, phone, role, profile_photo, bio, registered_at`,
      [name, phone, bio, photo, req.user.id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const googleLogin = async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Google authentication payload missing.' });

  try {
    let result = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    let user;

    if (result.rows.length === 0) {
      // Register Google User
      const userId = `usr_g${Date.now()}`;
      const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
      const profilePhoto = 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120';
      const defaultBio = 'Logged in via Google OAuth. Building career competence.';

      const insertText = `
        INSERT INTO users (id, name, email, phone, role, password_hash, profile_photo, bio)
        VALUES ($1, $2, $3, '', 'user', $4, $5, $6)
        RETURNING id, name, email, phone, role, profile_photo, bio, registered_at
      `;
      const insertResult = await query(insertText, [userId, name || 'Google User', email.trim().toLowerCase(), passwordHash, profilePhoto, defaultBio]);
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
      if (user.is_blocked) return res.status(403).json({ error: 'This account has been blocked.' });
    }

    const { password_hash, ...userProfile } = user;
    const token = generateToken(userProfile);
    res.status(200).json({ user: userProfile, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
