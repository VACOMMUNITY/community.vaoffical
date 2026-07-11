import { query } from '../db/index.js';

export const getThreads = async (req, res) => {
  try {
    const threadsRes = await query(
      `SELECT t.*, u.name as user_name, u.profile_photo as user_avatar 
       FROM forum_threads t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.date DESC`
    );
    const threads = threadsRes.rows;

    for (let t of threads) {
      const repliesRes = await query(
        `SELECT r.*, u.name as user_name, u.profile_photo as user_avatar 
         FROM forum_replies r
         JOIN users u ON r.user_id = u.id
         WHERE r.thread_id = $1
         ORDER BY r.date ASC`,
        [t.id]
      );
      // Map columns
      t.replies = repliesRes.rows.map(rep => ({
        id: rep.id,
        userId: rep.user_id,
        userName: rep.user_name,
        userAvatar: rep.user_avatar,
        content: rep.content,
        date: rep.date
      }));
      
      t.likes = t.likes || [];
      t.userName = t.user_name;
      t.userAvatar = t.user_avatar;
      t.userId = t.user_id;
    }

    res.status(200).json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createThread = async (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Please supply title and content.' });

  try {
    const threadId = `th_${Date.now()}`;
    const insertText = `
      INSERT INTO forum_threads (id, user_id, title, content, category, likes)
      VALUES ($1, $2, $3, $4, $5, '{}')
      RETURNING *
    `;
    const result = await query(insertText, [threadId, req.user.id, title, content, category || 'General Discussion']);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createReply = async (req, res) => {
  const { threadId } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment content cannot be empty.' });

  try {
    const replyId = `rep_${Date.now()}`;
    const insertText = `
      INSERT INTO forum_replies (id, thread_id, user_id, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await query(insertText, [replyId, threadId, req.user.id, content]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleLikeThread = async (req, res) => {
  const { id } = req.params;
  try {
    const threadRes = await query('SELECT likes FROM forum_threads WHERE id = $1', [id]);
    if (threadRes.rows.length === 0) return res.status(404).json({ error: 'Thread not found.' });

    let likes = threadRes.rows[0].likes || [];
    const userId = req.user.id;

    if (likes.includes(userId)) {
      likes = likes.filter(uid => uid !== userId);
    } else {
      likes.push(userId);
    }

    await query('UPDATE forum_threads SET likes = $1 WHERE id = $2', [likes, id]);
    res.status(200).json({ likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
