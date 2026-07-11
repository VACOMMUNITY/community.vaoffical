import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config();

let db;

// Helper to convert array strings
function parseArrayField(val) {
  if (!val) return [];
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (e) {
      if (val.startsWith('{') && val.endsWith('}')) {
        const cleaned = val.substring(1, val.length - 1).trim();
        if (!cleaned) return [];
        return cleaned.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      }
      return [];
    }
  }
  return val;
}

export const query = async (text, params = []) => {
  if (!db) {
    await initDB();
  }

  // Translate Postgres style $1, $2 to SQLite ?1, ?2
  const sqliteText = text.replace(/\$([0-9]+)/g, '?$1');

  // Convert array parameters to JSON strings
  const processedParams = params.map(p => {
    if (Array.isArray(p)) {
      return JSON.stringify(p);
    }
    return p;
  });

  try {
    const rows = await db.all(sqliteText, processedParams);

    // Process rows to parse arrays and convert booleans
    const processedRows = rows.map(row => {
      const newRow = { ...row };
      if ('wishlist' in newRow) {
        newRow.wishlist = parseArrayField(newRow.wishlist);
      }
      if ('coupons_used' in newRow) {
        newRow.coupons_used = parseArrayField(newRow.coupons_used);
      }
      if ('completed_lessons' in newRow) {
        newRow.completed_lessons = parseArrayField(newRow.completed_lessons);
      }
      if ('likes' in newRow) {
        newRow.likes = parseArrayField(newRow.likes);
      }
      if ('is_blocked' in newRow) {
        newRow.is_blocked = newRow.is_blocked === 1 || newRow.is_blocked === true || newRow.is_blocked === 'true';
      }
      return newRow;
    });

    return { rows: processedRows };
  } catch (err) {
    console.error('SQLITE QUERY ERROR:', err.message, 'Query:', sqliteText, 'Params:', processedParams);
    throw err;
  }
};

export const initDB = async () => {
  if (db) return;

  const dbPath = path.join(process.cwd(), 'community_va.db');
  console.log('Opening SQLite database at:', dbPath);

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  const schemaPath = path.join(process.cwd(), 'src/db/schema.sql');
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Running SQLite schema migrations...');
    
    // SQLite can execute multiple statements in exec()
    await db.exec(schemaSql);
    console.log('Schema tables verified/created successfully.');

    // Auto-seed check
    const userCheck = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCheck.count === 0) {
      console.log('Seeding initial community records into SQLite...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('Database connection or migration failed.');
    console.error(err.message);
  }
};

async function seedDatabase() {
  try {
    await db.run('BEGIN TRANSACTION');

    // 1. Seed Users (Hashed Passwords)
    const adminPassHash = await bcrypt.hash('admin', 10);
    const userPassHash = await bcrypt.hash('password', 10);

    const userSeedText = `
      INSERT INTO users (id, name, email, phone, role, password_hash, profile_photo, bio, registered_at, is_blocked)
      VALUES 
        (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 0),
        (?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, 0);
    `;
    const userValues = [
      'usr_1', 'Sarah Connor', 'sarah@example.com', '+1 555-0199', 'admin', adminPassHash, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', 'Founder and program manager at COMMUNITY.VA.', '2026-01-15T09:30:00Z',
      'usr_2', 'Alex Mercer', 'alex@example.com', '+1 555-0144', 'user', userPassHash, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', 'Computer Science undergraduate looking to improve soft skills.', '2026-03-20T14:15:00Z'
    ];
    await db.run(userSeedText, userValues);

    // 2. Seed Events
    const eventsQuery = `
      INSERT INTO events (id, title, description, banner, event_date, event_time, venue, fees, seats_total, seats_available, category)
      VALUES 
        ('evt_1', 'The Art of Negotiating Your First Salary', 'Learn negotiation scripts and salary estimation methods with mentors.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800', '2026-06-25', '18:00 - 20:00', 'Zoom Online Meeting', 15.00, 50, 49, 'Career Prep'),
        ('evt_2', 'Demystifying Non-Technical Roles in Tech', 'Panel discussion with UX designers, product owners, and scrum leads.', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800', '2026-07-12', '15:00 - 17:30', 'Vibrant Hub, NY & Hybrid', 0.00, 150, 150, 'Networking'),
        ('evt_3', 'Public Speaking BootCamp: Overcome Stage Fright', 'Conquer presentation anxiety with voice coaching and interactive pacing.', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800', '2026-08-02', '10:00 - 16:00', 'Convention Center, Hall B', 49.00, 30, 30, 'Public Speaking');
    `;
    await db.exec(eventsQuery);

    // 3. Seed Courses
    const coursesQuery = `
      INSERT INTO courses (id, title, description, thumbnail, price, instructor, category, rating, reviews_count)
      VALUES 
        ('crs_1', 'Public Speaking & Influential Presentation Mastery', 'Overcome fear and craft speech scripts that resonate. Learn vocal variety, gestures, and audience engagement.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600', 39.00, 'David Vance (Toastmaster Champion)', 'Public Speaking', 4.8, 124),
        ('crs_2', 'Resume Building & High-Impact Interview Strategy', 'Design ATS-compliant templates, script behavioral answers using the STAR method, and negotiate salary packages.', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600', 29.00, 'Clara Oswald (Ex-HR Google)', 'Career Prep', 4.9, 215),
        ('crs_3', 'Emotional Intelligence & Leadership Foundations', 'Develop self-awareness, active listening, conflict resolution, and leadership structures to lead high-performing teams.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600', 49.00, 'Marcus Aurelius (Management Consultant)', 'Leadership', 4.7, 98);
    `;
    await db.exec(coursesQuery);

    // 4. Seed Video Lessons
    const lessonsQuery = `
      INSERT INTO video_lessons (id, course_id, title, duration, video_url, sequence_order)
      VALUES 
        ('v1_1', 'crs_1', '1. Introduction to Public Speaking', '08:45', 'https://www.w3schools.com/html/mov_bbb.mp4', 1),
        ('v1_2', 'crs_1', '2. Deconstructing Stage Fright', '12:30', 'https://www.w3schools.com/html/movie.mp4', 2),
        ('v1_3', 'crs_1', '3. The Speech Structure Blueprint', '15:10', 'https://www.w3schools.com/html/mov_bbb.mp4', 3),
        ('v2_1', 'crs_2', '1. Decoding Applicant Tracking Systems (ATS)', '10:15', 'https://www.w3schools.com/html/mov_bbb.mp4', 1),
        ('v2_2', 'crs_2', '2. Framing Experience using STAR Framework', '14:50', 'https://www.w3schools.com/html/movie.mp4', 2),
        ('v3_1', 'crs_3', '1. Pillars of Emotional Intelligence', '09:30', 'https://www.w3schools.com/html/mov_bbb.mp4', 1);
    `;
    await db.exec(lessonsQuery);

    // 5. Seed Resources
    const resourcesQuery = `
      INSERT INTO course_resources (id, course_id, name, url, resource_type)
      VALUES 
        ('r1_1', 'crs_1', 'Speech Outline Worksheet.pdf', '#', 'PDF'),
        ('r1_2', 'crs_1', 'Performance Checklist.pdf', '#', 'PDF'),
        ('r2_1', 'crs_2', 'ATS Friendly Resume Template.docx', '#', 'DOCX'),
        ('r2_2', 'crs_2', 'STAR Interview Cheat Sheet.pdf', '#', 'PDF');
    `;
    await db.exec(resourcesQuery);

    // 6. Seed Registrations, Enrollments, Payments (SQLite uses JSON strings instead of PG arrays)
    const activityQuery = `
      INSERT INTO registrations (id, user_id, event_id, payment_status, payment_id, registered_at)
      VALUES ('reg_1', 'usr_2', 'evt_1', 'completed', 'pay_evt_1', '2026-06-05T10:12:00Z');

      INSERT INTO enrollments (id, user_id, course_id, progress, completed_lessons, certificate_status, certificate_id, enrolled_at)
      VALUES ('enr_1', 'usr_2', 'crs_1', 66, '["v1_1", "v1_2"]', 'not_earned', null, '2026-06-01T15:00:00Z');

      INSERT INTO payments (id, user_id, amount, payment_method, status, item_type, item_id, item_name, date)
      VALUES 
        ('pay_evt_1', 'usr_2', 15.00, 'UPI', 'success', 'event', 'evt_1', 'The Art of Negotiating Your First Salary', '2026-06-05T10:12:00Z'),
        ('pay_crs_1', 'usr_2', 39.00, 'Credit Card', 'success', 'course', 'crs_1', 'Public Speaking & Influential Presentation Mastery', '2026-06-01T15:00:00Z');
    `;
    await db.exec(activityQuery);

    // 7. Seed Forum
    const forumQuery = `
      INSERT INTO forum_threads (id, user_id, title, content, category, likes, date)
      VALUES 
        ('th_1', 'usr_2', 'How to deal with stage fright in online Zoom meetings?', 'Hi! I find myself getting extremely nervous even during Zoom presentations where I do not see the audience faces directly.', 'Public Speaking', '["usr_1"]', '2026-06-10T12:00:00Z'),
        ('th_2', 'usr_1', 'Welcome to COMMUNITY.VA Discussion Space!', 'Welcome everyone! This forum is a space to ask questions, share tips on public speaking, CV writing, career planning.', 'General Discussion', '["usr_2"]', '2026-06-01T09:00:00Z');

      INSERT INTO forum_replies (id, thread_id, user_id, content, date)
      VALUES 
        ('rep_1', 'th_1', 'usr_1', 'Try speaking to a specific object near your camera lens! It grounds your vision.', '2026-06-10T14:30:00Z'),
        ('rep_2', 'th_2', 'usr_2', 'Excited to be here! Looking forward to learning.', '2026-06-01T11:15:00Z');
    `;
    await db.exec(forumQuery);

    // 8. Seed Blogs
    const blogsQuery = `
      INSERT INTO blogs (id, title, excerpt, content, banner, author, date, reads, likes)
      VALUES 
        ('blg_1', '5 Soft Skills Technical Interviewers Look For', 'While coding and logic are critical, recruiters hire candidates with solid communication.', '### 1. Active Listening\nWhen interviewers offer advice, listen!\n\n### 2. Structured Thoughts\nExplain algorithms before typing.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800', 'Clara Oswald', '2026-06-08', 432, 87),
        ('blg_2', 'The Blueprint of an ATS-Compliant Resume', 'Formatting guidelines to pass automatic parsers and land interviews.', '### Formatting Rules:\n- Avoid text columns or shapes.\n- Use Arial or Calibri.\n\n### Action verbs:\n- "Led", "Optimized", "Delivered".', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800', 'Sarah Connor', '2026-05-28', 610, 132);
    `;
    await db.exec(blogsQuery);

    await db.run('COMMIT');
    console.log('SQLite database seeded with preloaded data successfully.');
  } catch (err) {
    await db.run('ROLLBACK');
    console.error('Error seeding SQLite database:', err);
  }
}
