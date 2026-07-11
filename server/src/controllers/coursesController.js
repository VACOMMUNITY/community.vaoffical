import { query } from '../db/index.js';

export const getCourses = async (req, res) => {
  try {
    const coursesRes = await query('SELECT * FROM courses ORDER BY id DESC');
    const courses = coursesRes.rows;

    // Fetch lessons and resources for each course
    for (let course of courses) {
      const videos = await query('SELECT id, title, duration, video_url FROM video_lessons WHERE course_id = $1 ORDER BY sequence_order ASC', [course.id]);
      const resources = await query('SELECT name, url, resource_type as type FROM course_resources WHERE course_id = $1', [course.id]);
      course.videos = videos.rows;
      course.resources = resources.rows;
    }

    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM courses WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });

    const course = result.rows[0];
    const videos = await query('SELECT id, title, duration, video_url FROM video_lessons WHERE course_id = $1 ORDER BY sequence_order ASC', [id]);
    const resources = await query('SELECT name, url, resource_type as type FROM course_resources WHERE course_id = $1', [id]);
    course.videos = videos.rows;
    course.resources = resources.rows;

    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const enrollInCourse = async (req, res) => {
  const { courseId, amount, paymentMethod } = req.body;
  if (!courseId) return res.status(400).json({ error: 'Course ID is required.' });

  try {
    const courseCheck = await query('SELECT title FROM courses WHERE id = $1', [courseId]);
    if (courseCheck.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });
    const courseTitle = courseCheck.rows[0].title;

    // Verify if already enrolled
    const exists = await query('SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2', [req.user.id, courseId]);
    if (exists.rows.length > 0) return res.status(400).json({ error: 'You are already enrolled in this course.' });

    const paymentId = `pay_${Date.now()}`;
    const enrollmentId = `enr_${Date.now()}`;

    // Insert payment
    await query(
      `INSERT INTO payments (id, user_id, amount, payment_method, status, item_type, item_id, item_name)
       VALUES ($1, $2, $3, $4, 'success', 'course', $5, $6)`,
      [paymentId, req.user.id, amount || 0, paymentMethod || 'Credit Card', courseId, courseTitle]
    );

    // Insert enrollment
    const enrollmentResult = await query(
      `INSERT INTO enrollments (id, user_id, course_id, progress, completed_lessons, certificate_status)
       VALUES ($1, $2, $3, 0, '{}', 'not_earned')
       RETURNING *`,
      [enrollmentId, req.user.id, courseId]
    );

    res.status(201).json({ enrollment: enrollmentResult.rows[0], message: 'Enrollment successful!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const result = await query('SELECT * FROM enrollments WHERE user_id = $1', [req.user.id]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLessonProgress = async (req, res) => {
  const { enrollmentId, videoId, courseId } = req.body;
  if (!enrollmentId || !videoId || !courseId) {
    return res.status(400).json({ error: 'Please supply enrollmentId, videoId, and courseId.' });
  }

  try {
    // Get current enrollment details
    const enrRes = await query('SELECT * FROM enrollments WHERE id = $1 AND user_id = $2', [enrollmentId, req.user.id]);
    if (enrRes.rows.length === 0) return res.status(404).json({ error: 'Enrollment not found.' });
    const enrollment = enrRes.rows[0];

    // Get course video modules count
    const videoCountRes = await query('SELECT COUNT(*) FROM video_lessons WHERE course_id = $1', [courseId]);
    const totalLessons = parseInt(videoCountRes.rows[0].count) || 1;

    let completed = enrollment.completed_lessons || [];
    const isCompleted = completed.includes(videoId);

    if (isCompleted) {
      completed = completed.filter(id => id !== videoId);
    } else {
      completed.push(videoId);
    }

    const progressPercent = Math.min(100, Math.round((completed.length / totalLessons) * 100));
    
    let certStatus = enrollment.certificate_status;
    let certId = enrollment.certificate_id;

    if (progressPercent === 100 && certStatus !== 'earned') {
      certStatus = 'earned';
      certId = `CERT_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    } else if (progressPercent < 100) {
      certStatus = 'not_earned';
    }

    const updateText = `
      UPDATE enrollments 
      SET completed_lessons = $1, progress = $2, certificate_status = $3, certificate_id = $4
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `;
    const updateRes = await query(updateText, [completed, progressPercent, certStatus, certId, enrollmentId, req.user.id]);
    res.status(200).json(updateRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleWishlist = async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ error: 'Course ID is required.' });

  try {
    const userRes = await query('SELECT wishlist FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User profile not found.' });

    let wishlist = userRes.rows[0].wishlist || [];
    if (wishlist.includes(courseId)) {
      wishlist = wishlist.filter(id => id !== courseId);
    } else {
      wishlist.push(courseId);
    }

    await query('UPDATE users SET wishlist = $1 WHERE id = $2', [wishlist, req.user.id]);
    res.status(200).json({ wishlist, message: 'Wishlist updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin Operations
export const addCourse = async (req, res) => {
  const { title, description, thumbnail, price, instructor, category } = req.body;
  if (!title || !instructor) return res.status(400).json({ error: 'Please supply course title and instructor.' });

  try {
    const newCourseId = `crs_${Date.now()}`;
    const insertText = `
      INSERT INTO courses (id, title, description, thumbnail, price, instructor, category, rating, reviews_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 4.8, 1)
      RETURNING *
    `;
    const result = await query(insertText, [
      newCourseId, title, description || '', 
      thumbnail || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
      Number(price) || 0, instructor, category || 'General'
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM courses WHERE id = $1', [id]);
    res.status(200).json({ message: 'Course deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addVideoLesson = async (req, res) => {
  const { id } = req.params; // course id
  const { title, duration, videoUrl } = req.body;
  if (!title || !duration) return res.status(400).json({ error: 'Please fill title and duration.' });

  try {
    const countRes = await query('SELECT COUNT(*) FROM video_lessons WHERE course_id = $1', [id]);
    const nextSeq = parseInt(countRes.rows[0].count) + 1;

    const newVideoId = `vid_${Date.now()}`;
    const insertText = `
      INSERT INTO video_lessons (id, course_id, title, duration, video_url, sequence_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await query(insertText, [
      newVideoId, id, title, duration, 
      videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4', nextSeq
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, instructor, category, thumbnail } = req.body;
  try {
    const queryText = `
      UPDATE courses 
      SET title = $1, description = $2, thumbnail = $3, price = $4, instructor = $5, category = $6
      WHERE id = $7
      RETURNING *
    `;
    const result = await query(queryText, [title, description, thumbnail, Number(price), instructor, category, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
