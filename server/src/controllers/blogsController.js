import { query } from '../db/index.js';

export const getBlogs = async (req, res) => {
  try {
    const result = await query('SELECT * FROM blogs ORDER BY date DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Blog post not found.' });
    
    // Increment read counter
    await query('UPDATE blogs SET reads = reads + 1 WHERE id = $1', [id]);

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
