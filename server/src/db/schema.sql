-- SQLite Schema for COMMUNITY.VA

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user',
  password_hash VARCHAR(255) NOT NULL,
  profile_photo TEXT,
  bio TEXT,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_blocked BOOLEAN DEFAULT false,
  wishlist TEXT DEFAULT '[]',
  coupons_used TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  banner TEXT,
  event_date VARCHAR(50),
  event_time VARCHAR(50),
  venue VARCHAR(255),
  fees DECIMAL(10,2) DEFAULT 0.00,
  seats_total INT DEFAULT 50,
  seats_available INT DEFAULT 50,
  category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  instructor VARCHAR(255),
  category VARCHAR(100),
  rating DECIMAL(2,1) DEFAULT 5.0,
  reviews_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS video_lessons (
  id VARCHAR(255) PRIMARY KEY,
  course_id VARCHAR(255) REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  duration VARCHAR(20),
  video_url TEXT,
  sequence_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS course_resources (
  id VARCHAR(255) PRIMARY KEY,
  course_id VARCHAR(255) REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT,
  resource_type VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS registrations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  event_id VARCHAR(255) REFERENCES events(id) ON DELETE CASCADE,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(255),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(255) REFERENCES courses(id) ON DELETE CASCADE,
  progress INT DEFAULT 0,
  completed_lessons TEXT DEFAULT '[]',
  certificate_status VARCHAR(50) DEFAULT 'not_earned',
  certificate_id VARCHAR(100),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'success',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  item_type VARCHAR(50),
  item_id VARCHAR(255),
  item_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS forum_threads (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category VARCHAR(100),
  likes TEXT DEFAULT '[]',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_replies (
  id VARCHAR(255) PRIMARY KEY,
  thread_id VARCHAR(255) REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT,
  banner TEXT,
  author VARCHAR(255),
  date VARCHAR(50),
  reads INT DEFAULT 0,
  likes INT DEFAULT 0
);
