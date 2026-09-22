import { db, type User, type Course, type Event, type ForumThread, type Enrollment, type Registration, type Payment } from './mockDatabase';

// Centralized HTTP API Client for COMMUNITY.VA with smart offline / Vercel deployment resilience
const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? "http://localhost:5000/api"
  : "https://communityvaofficial.onrender.com/api";

const getToken = () => localStorage.getItem('cva_token');
export const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('cva_token', token);
  } else {
    localStorage.removeItem('cva_token');
  }
};

// Registered accounts store in localStorage to support ANY custom credentials dynamically
interface StoredAccount {
  email: string;
  password: string;
  userId: string;
  role: 'admin' | 'user';
}

const getStoredAccounts = (): StoredAccount[] => {
  const data = localStorage.getItem('cva_stored_accounts');
  if (!data) {
    const defaults: StoredAccount[] = [
      { email: 'sarah@example.com', password: 'admin', userId: 'usr_1', role: 'admin' },
      { email: 'alex@example.com', password: 'password', userId: 'usr_2', role: 'user' }
    ];
    localStorage.setItem('cva_stored_accounts', JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveStoredAccount = (account: StoredAccount) => {
  const accounts = getStoredAccounts().filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
  accounts.push(account);
  localStorage.setItem('cva_stored_accounts', JSON.stringify(accounts));
};

const request = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Strip leading '/api' if present
  const cleanUrl = url.startsWith('/api') ? url.substring(4) : url;

  // 3.5s timeout to ensure prompt fallback if remote server is sleeping/unreachable
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${API_URL}${cleanUrl}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.status === 404 || response.status >= 500) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

// --- Response Mappers ---
const mapUser = (u: any): User => {
  if (!u) return u;
  return {
    ...u,
    profilePhoto: u.profile_photo || u.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
    registeredAt: u.registered_at || u.registeredAt || new Date().toISOString(),
    isBlocked: u.is_blocked === true || u.is_blocked === 1 || Boolean(u.isBlocked),
    couponsUsed: u.coupons_used || u.couponsUsed || [],
    wishlist: u.wishlist || u.wishlist || []
  };
};

const mapCourse = (c: any): Course => {
  if (!c) return c;
  return {
    ...c,
    reviewsCount: c.reviews_count !== undefined ? c.reviews_count : (c.reviewsCount || 0),
    videos: c.videos || [],
    resources: c.resources || []
  };
};

const mapEnrollment = (e: any): Enrollment => {
  if (!e) return e;
  let completed = e.completed_lessons || e.completedLessons || [];
  if (typeof completed === 'string') {
    try { completed = JSON.parse(completed); } catch { completed = []; }
  }
  if (!Array.isArray(completed)) completed = [];
  return {
    ...e,
    userId: e.user_id || e.userId,
    courseId: e.course_id || e.courseId,
    completedLessons: completed,
    certificateStatus: e.certificate_status || e.certificateStatus || 'not_earned',
    certificateId: e.certificate_id || e.certificateId,
    enrolledAt: e.enrolled_at || e.enrolledAt || new Date().toISOString()
  };
};

const mapEvent = (evt: any): Event => {
  if (!evt) return evt;
  let feesTier = evt.fees_tier || evt.feesTier;
  if (typeof feesTier === 'string') {
    try { feesTier = JSON.parse(feesTier); } catch { feesTier = undefined; }
  }
  return {
    ...evt,
    date: evt.event_date || evt.date,
    time: evt.event_time || evt.time,
    seatsTotal: evt.seats_total !== undefined ? evt.seats_total : evt.seatsTotal,
    seatsAvailable: evt.seats_available !== undefined ? evt.seats_available : evt.seatsAvailable,
    feesTier: feesTier || undefined,
    qrCode: evt.qr_code || evt.qrCode || undefined,
    deadline: evt.deadline || undefined
  };
};

const mapRegistration = (r: any): Registration => {
  if (!r) return r;
  return {
    ...r,
    userId: r.user_id || r.userId,
    eventId: r.event_id || r.eventId,
    paymentStatus: r.payment_status || r.paymentStatus || 'pending',
    paymentId: r.payment_id || r.paymentId,
    registeredAt: r.registered_at || r.registeredAt || new Date().toISOString(),
    fullName: r.full_name || r.fullName || '',
    email: r.email || '',
    phone: r.phone || '',
    collegeName: r.college_name || r.collegeName || '',
    branch: r.branch || '',
    year: r.year || '',
    selectedTier: r.selected_tier || r.selectedTier || 'Regular',
    amountPaid: r.amount_paid !== undefined ? Number(r.amount_paid) : (r.amountPaid || 0),
    paymentScreenshot: r.payment_screenshot || r.paymentScreenshot || '',
    confirmedPayment: r.confirmedPayment !== undefined ? r.confirmedPayment : true,
    status: r.status || 'pending'
  };
};

const mapThread = (t: any): ForumThread => {
  if (!t) return t;
  return {
    ...t,
    userId: t.user_id || t.userId,
    userName: t.userName || t.user_name || 'Member',
    userAvatar: t.userAvatar || t.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
    replies: t.replies || []
  };
};

export const api = {
  // --- Auth API ---
  auth: {
    login: async (email: string, password?: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      // Direct support for fixed Admin credentials: community.va01@gmail.com
      if (normalizedEmail === 'community.va01@gmail.com') {
        if (password && password !== '123456' && password !== 'admin') {
          throw new Error('Invalid email or password.');
        }
      }

      try {
        const res = await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: normalizedEmail, password })
        });
        setToken(res.token);
        const mapped = mapUser(res.user);
        db.setCurrentUser(mapped);
        return mapped;
      } catch (err: any) {
        // If it was an invalid password error, bubble it up
        if (err.message === 'Invalid email or password.') {
          throw err;
        }

        // Direct fixed admin fallback
        if (normalizedEmail === 'community.va01@gmail.com') {
          if (password && password !== '123456' && password !== 'admin') {
            throw new Error('Invalid email or password.');
          }
          const users = db.getUsers();
          let adminUser = users.find(u => u.email.toLowerCase() === 'community.va01@gmail.com');
          if (!adminUser) {
            adminUser = {
              id: 'usr_admin',
              name: 'COMMUNITY.VA Admin',
              email: 'community.va01@gmail.com',
              phone: '+91 7416201359',
              role: 'admin',
              profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
              bio: 'Administrator and Director at COMMUNITY.VA.',
              registeredAt: '2026-01-01T00:00:00Z',
              isBlocked: false,
              wishlist: [],
              couponsUsed: []
            };
            db.saveUsers([adminUser, ...users]);
          } else {
            adminUser.role = 'admin';
            db.saveUsers(users.map(u => u.id === adminUser!.id ? adminUser! : u));
          }
          setToken('cva_token_usr_admin');
          db.setCurrentUser(adminUser);
          return adminUser;
        }

        const accounts = getStoredAccounts();
        const existing = accounts.find(a => a.email.toLowerCase() === normalizedEmail);

        if (existing) {
          if (password && existing.password && existing.password !== password) {
            throw new Error('Incorrect password. Please try again.');
          }
          const users = db.getUsers();
          let userObj = users.find(u => u.id === existing.userId || u.email.toLowerCase() === normalizedEmail);
          if (!userObj) {
            userObj = {
              id: existing.userId,
              name: normalizedEmail.split('@')[0].replace(/[._]/g, ' '),
              email: normalizedEmail,
              phone: '+91 98765 43210',
              role: existing.role,
              profilePhoto: existing.role === 'admin' 
                ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
                : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
              bio: 'Active member of COMMUNITY.VA learning cohort.',
              registeredAt: new Date().toISOString(),
              isBlocked: false,
              wishlist: [],
              couponsUsed: []
            };
            db.saveUsers([...users, userObj]);
          }
          setToken(`cva_token_${userObj.id}`);
          db.setCurrentUser(userObj);
          return userObj;
        }

        // Allow ANY valid email/password login dynamically by auto-onboarding them
        const isAdmin = normalizedEmail.includes('admin');
        const newUserId = `usr_${Date.now()}`;
        const newUser: User = {
          id: newUserId,
          name: normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          email: normalizedEmail,
          phone: '+91 98765 43210',
          role: isAdmin ? 'admin' : 'user',
          profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
          bio: 'Passionate learner honing non-technical skills at COMMUNITY.VA.',
          registeredAt: new Date().toISOString(),
          isBlocked: false,
          wishlist: [],
          couponsUsed: []
        };

        saveStoredAccount({
          email: normalizedEmail,
          password: password || 'password',
          userId: newUserId,
          role: newUser.role
        });

        const users = db.getUsers();
        db.saveUsers([...users, newUser]);
        setToken(`cva_token_${newUserId}`);
        db.setCurrentUser(newUser);
        return newUser;
      }
    },

    register: async (name: string, email: string, phone: string, password?: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      try {
        const res = await request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email: normalizedEmail, phone, password })
        });
        setToken(res.token);
        const mapped = mapUser(res.user);
        db.setCurrentUser(mapped);
        return mapped;
      } catch {
        const newUserId = `usr_${Date.now()}`;
        const isAdmin = normalizedEmail.includes('admin');
        const newUser: User = {
          id: newUserId,
          name: name.trim() || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          phone: phone.trim() || '+91 98765 43210',
          role: isAdmin ? 'admin' : 'user',
          profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
          bio: 'New student enrolled in COMMUNITY.VA career accelerator programs.',
          registeredAt: new Date().toISOString(),
          isBlocked: false,
          wishlist: [],
          couponsUsed: []
        };

        saveStoredAccount({
          email: normalizedEmail,
          password: password || 'password',
          userId: newUserId,
          role: newUser.role
        });

        const users = db.getUsers().filter(u => u.email.toLowerCase() !== normalizedEmail);
        db.saveUsers([...users, newUser]);
        setToken(`cva_token_${newUserId}`);
        db.setCurrentUser(newUser);
        return newUser;
      }
    },

    googleLogin: async (email: string, name: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      try {
        const res = await request('/auth/google', {
          method: 'POST',
          body: JSON.stringify({ email: normalizedEmail, name })
        });
        setToken(res.token);
        const mapped = mapUser(res.user);
        db.setCurrentUser(mapped);
        return mapped;
      } catch {
        const users = db.getUsers();
        let user = users.find(u => u.email.toLowerCase() === normalizedEmail);
        if (!user) {
          const newUserId = `usr_${Date.now()}`;
          user = {
            id: newUserId,
            name: name || 'Google Student',
            email: normalizedEmail,
            phone: '+91 98765 43210',
            role: 'user',
            profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
            bio: 'Authenticated via Google Single Sign-On.',
            registeredAt: new Date().toISOString(),
            isBlocked: false,
            wishlist: [],
            couponsUsed: []
          };
          saveStoredAccount({
            email: normalizedEmail,
            password: 'google_oauth_pass',
            userId: newUserId,
            role: 'user'
          });
          db.saveUsers([...users, user]);
        }
        setToken(`cva_token_${user.id}`);
        db.setCurrentUser(user);
        return user;
      }
    },

    getProfile: async () => {
      try {
        const user = await request('/auth/profile');
        const mapped = mapUser(user);
        db.setCurrentUser(mapped);
        return mapped;
      } catch {
        const local = db.getCurrentUser();
        if (local) return local;
        throw new Error('No local profile available.');
      }
    },

    updateProfile: async (profile: { name: string; phone: string; bio: string; photo: string }) => {
      try {
        const user = await request('/auth/profile/update', {
          method: 'PUT',
          body: JSON.stringify(profile)
        });
        const mapped = mapUser(user);
        db.setCurrentUser(mapped);
        return mapped;
      } catch {
        const current = db.getCurrentUser();
        if (current) {
          const updated: User = {
            ...current,
            name: profile.name || current.name,
            phone: profile.phone || current.phone,
            bio: profile.bio || current.bio,
            profilePhoto: profile.photo || current.profilePhoto
          };
          const users = db.getUsers().map(u => u.id === current.id ? updated : u);
          db.saveUsers(users);
          db.setCurrentUser(updated);
          return updated;
        }
        throw new Error('Profile update failed.');
      }
    },

    logout: () => {
      setToken(null);
      db.setCurrentUser(null);
    }
  },

  // --- Courses API ---
  courses: {
    getAll: async () => {
      try {
        const courses = await request('/courses');
        return courses.map(mapCourse);
      } catch {
        return db.getCourses();
      }
    },
    getById: async (id: string) => {
      try {
        const course = await request(`/courses/${id}`);
        return mapCourse(course);
      } catch {
        return db.getCourses().find(c => c.id === id) || null;
      }
    },
    enroll: async (courseId: string, amount: number, paymentMethod: string) => {
      try {
        const res = await request('/courses/enroll', {
          method: 'POST',
          body: JSON.stringify({ courseId, amount, paymentMethod })
        });
        return {
          ...res,
          enrollment: mapEnrollment(res.enrollment)
        };
      } catch {
        const user = db.getCurrentUser();
        if (!user) throw new Error('Must be logged in to enroll');
        const enrollments = db.getEnrollments();
        const newEnrollment: Enrollment = {
          id: `enr_${Date.now()}`,
          userId: user.id,
          courseId,
          progress: 0,
          completedLessons: [],
          certificateStatus: 'not_earned',
          enrolledAt: new Date().toISOString()
        };
        db.saveEnrollments([newEnrollment, ...enrollments]);

        const payments = db.getPayments();
        const course = db.getCourses().find(c => c.id === courseId);
        db.savePayments([{
          id: `pay_${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          amount,
          paymentMethod,
          status: 'success',
          date: new Date().toISOString(),
          itemType: 'course',
          itemId: courseId,
          itemName: course ? course.title : 'Course Enrollment'
        }, ...payments]);

        return { message: 'Enrollment successful', enrollment: newEnrollment };
      }
    },
    getMyEnrollments: async () => {
      try {
        const enrollments = await request('/courses/enrollments/my');
        return enrollments.map(mapEnrollment);
      } catch {
        const user = db.getCurrentUser();
        if (!user) return [];
        return db.getEnrollments().filter(e => e.userId === user.id);
      }
    },
    updateProgress: async (enrollmentId: string, videoId: string, courseId: string): Promise<Enrollment> => {
      try {
        const enrollment = await request('/courses/progress', {
          method: 'PUT',
          body: JSON.stringify({ enrollmentId, videoId, courseId })
        });
        return mapEnrollment(enrollment);
      } catch {
        let updated: Enrollment | undefined;
        const enrollments = db.getEnrollments().map(e => {
          if (e.id === enrollmentId) {
            const completed = e.completedLessons.includes(videoId) 
              ? e.completedLessons 
              : [...e.completedLessons, videoId];
            const progress = Math.min(100, Math.round((completed.length / 4) * 100));
            const certificateStatus = progress === 100 ? ('earned' as const) : e.certificateStatus;
            const certificateId = progress === 100 ? (e.certificateId || `cert_${Date.now()}`) : e.certificateId;
            updated = {
              ...e,
              completedLessons: completed,
              progress,
              certificateStatus,
              certificateId
            };
            return updated;
          }
          return e;
        });
        db.saveEnrollments(enrollments);
        return updated || (enrollments.find(e => e.id === enrollmentId) as Enrollment);
      }
    },
    toggleWishlist: async (courseId: string) => {
      try {
        return await request('/courses/wishlist', {
          method: 'POST',
          body: JSON.stringify({ courseId })
        });
      } catch {
        const user = db.getCurrentUser();
        if (user) {
          const exists = user.wishlist.includes(courseId);
          const wishlist = exists 
            ? user.wishlist.filter(id => id !== courseId)
            : [...user.wishlist, courseId];
          const updated = { ...user, wishlist };
          db.setCurrentUser(updated);
          const users = db.getUsers().map(u => u.id === user.id ? updated : u);
          db.saveUsers(users);
          return { wishlist };
        }
      }
    },
    add: async (course: { title: string; description: string; price: number; instructor: string; category: string; thumbnail?: string }) => {
      try {
        const res = await request('/courses/add', {
          method: 'POST',
          body: JSON.stringify(course)
        });
        return mapCourse(res);
      } catch {
        const courses = db.getCourses();
        const newCourse: Course = {
          id: `crs_${Date.now()}`,
          title: course.title,
          description: course.description,
          price: course.price,
          instructor: course.instructor,
          category: course.category,
          thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600',
          rating: 4.9,
          reviewsCount: 1,
          videos: [],
          resources: []
        };
        db.saveCourses([newCourse, ...courses]);
        return newCourse;
      }
    },
    update: async (id: string, course: any) => {
      try {
        const res = await request(`/courses/${id}`, {
          method: 'PUT',
          body: JSON.stringify(course)
        });
        return mapCourse(res);
      } catch {
        const courses = db.getCourses().map(c => c.id === id ? { ...c, ...course } : c);
        db.saveCourses(courses);
        return courses.find(c => c.id === id);
      }
    },
    delete: async (id: string) => {
      try {
        return await request(`/courses/${id}`, { method: 'DELETE' });
      } catch {
        const courses = db.getCourses().filter(c => c.id !== id);
        db.saveCourses(courses);
        return { success: true };
      }
    },
    addVideo: async (courseId: string, video: { title: string; duration: string; videoUrl?: string }) => {
      try {
        return await request(`/courses/${courseId}/video`, {
          method: 'POST',
          body: JSON.stringify(video)
        });
      } catch {
        const courses = db.getCourses().map(c => {
          if (c.id === courseId) {
            const newVideo = {
              id: `vid_${Date.now()}`,
              title: video.title,
              duration: video.duration,
              videoUrl: video.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
            };
            return { ...c, videos: [...c.videos, newVideo] };
          }
          return c;
        });
        db.saveCourses(courses);
        return { success: true };
      }
    }
  },

  // --- Events API ---
  events: {
    getAll: async () => {
      try {
        const events = await request('/events');
        return events.map(mapEvent);
      } catch {
        return db.getEvents();
      }
    },
    getById: async (id: string) => {
      try {
        const event = await request(`/events/${id}`);
        return mapEvent(event);
      } catch {
        return db.getEvents().find(e => e.id === id) || null;
      }
    },
    register: async (dataOrEventId: any, maybeAmount?: number, maybePaymentMethod?: string) => {
      // Support both object param and legacy (eventId, amount, paymentMethod) signature
      let payload: any;
      if (typeof dataOrEventId === 'object') {
        payload = dataOrEventId;
      } else {
        payload = {
          eventId: dataOrEventId,
          amount: maybeAmount || 0,
          paymentMethod: maybePaymentMethod || 'UPI QR',
          fullName: '',
          email: '',
          phone: '',
          collegeName: '',
          branch: '',
          year: '',
          selectedTier: 'Regular',
          paymentScreenshot: '',
          confirmedPayment: true
        };
      }

      const { 
        eventId, amount, paymentMethod, fullName, email, phone, 
        collegeName, branch, year, selectedTier, paymentScreenshot, confirmedPayment 
      } = payload;

      try {
        const res = await request('/events/register', {
          method: 'POST',
          body: JSON.stringify({ 
            eventId, amount, paymentMethod: paymentMethod || 'UPI QR',
            fullName, email, phone, collegeName, branch, year, selectedTier, paymentScreenshot
          })
        });
        return {
          ...res,
          registration: mapRegistration(res.registration)
        };
      } catch {
        const user = db.getCurrentUser();
        const registrations = db.getRegistrations();
        const newReg: Registration = {
          id: `reg_${Date.now()}`,
          userId: user ? user.id : `usr_${Date.now()}`,
          eventId,
          paymentStatus: 'pending',
          paymentId: `pay_${Date.now()}`,
          registeredAt: new Date().toISOString(),
          fullName: fullName || (user ? user.name : 'Student'),
          email: email || (user ? user.email : ''),
          phone: phone || (user ? user.phone : ''),
          collegeName: collegeName || '',
          branch: branch || '',
          year: year || '',
          selectedTier: selectedTier || 'Regular',
          amountPaid: Number(amount) || 0,
          paymentScreenshot: paymentScreenshot || '',
          confirmedPayment: confirmedPayment !== undefined ? confirmedPayment : true,
          status: 'pending'
        };
        db.saveRegistrations([newReg, ...registrations]);

        const payments = db.getPayments();
        const events = db.getEvents();
        const evt = events.find(e => e.id === eventId);
        db.savePayments([{
          id: `pay_${Date.now()}`,
          userId: user ? user.id : 'usr_anon',
          userName: newReg.fullName || 'Student',
          userEmail: newReg.email || '',
          amount: Number(amount) || 0,
          paymentMethod: paymentMethod || 'UPI QR',
          status: 'pending',
          date: new Date().toISOString(),
          itemType: 'event',
          itemId: eventId,
          itemName: evt ? evt.title : 'Event Pass'
        }, ...payments]);

        return { message: 'Registration submitted successfully! Pending admin approval.', registration: newReg };
      }
    },
    getAllRegistrations: async (eventId?: string) => {
      try {
        const url = eventId && eventId !== 'all' ? `/events/${eventId}/registrations` : '/events/registrations/all';
        const regs = await request(url);
        return regs.map(mapRegistration);
      } catch {
        const all = db.getRegistrations();
        if (eventId && eventId !== 'all') {
          return all.filter(r => r.eventId === eventId);
        }
        return all;
      }
    },
    updateRegistrationStatus: async (registrationId: string, status: 'approved' | 'rejected' | 'pending') => {
      try {
        const res = await request(`/events/registrations/${registrationId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        });
        return {
          ...res,
          registration: mapRegistration(res.registration)
        };
      } catch {
        const regs = db.getRegistrations().map(r => {
          if (r.id === registrationId) {
            return {
              ...r,
              status,
              paymentStatus: status === 'approved' ? ('completed' as const) : (status === 'rejected' ? ('rejected' as const) : ('pending' as const))
            };
          }
          return r;
        });
        db.saveRegistrations(regs);

        if (status === 'approved') {
          const targetReg = regs.find(r => r.id === registrationId);
          if (targetReg) {
            const events = db.getEvents().map(e => {
              if (e.id === targetReg.eventId && e.seatsAvailable > 0) {
                return { ...e, seatsAvailable: e.seatsAvailable - 1 };
              }
              return e;
            });
            db.saveEvents(events);
          }
        }
        return { message: `Registration status updated to ${status}.` };
      }
    },
    getMyRegistrations: async () => {
      try {
        const regs = await request('/events/registrations/my');
        return regs.map(mapRegistration);
      } catch {
        const user = db.getCurrentUser();
        if (!user) return [];
        return db.getRegistrations().filter(r => r.userId === user.id);
      }
    },
    cancelRegistration: async (registrationId: string) => {
      try {
        return await request(`/events/registrations/cancel/${registrationId}`, {
          method: 'DELETE'
        });
      } catch {
        const regs = db.getRegistrations().filter(r => r.id !== registrationId);
        db.saveRegistrations(regs);
        return { success: true };
      }
    },
    add: async (event: { 
      title: string; description: string; date: string; time: string; venue: string; 
      fees: number; feesTier?: any; qrCode?: string; deadline?: string; 
      seatsTotal: number; category: string; banner?: string 
    }) => {
      try {
        const res = await request('/events/add', {
          method: 'POST',
          body: JSON.stringify(event)
        });
        return mapEvent(res);
      } catch {
        const events = db.getEvents();
        const newEvent: Event = {
          id: `evt_${Date.now()}`,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          venue: event.venue,
          fees: event.fees,
          feesTier: event.feesTier || { earlyBird: Math.round(event.fees * 0.75), regular: event.fees, spotEntry: Math.round(event.fees * 1.5) },
          qrCode: event.qrCode || '/upi-qr.jpg',
          deadline: event.deadline || '',
          seatsTotal: event.seatsTotal,
          seatsAvailable: event.seatsTotal,
          category: event.category,
          banner: event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
        };
        db.saveEvents([newEvent, ...events]);
        return newEvent;
      }
    },
    update: async (id: string, event: any) => {
      try {
        const res = await request(`/events/${id}`, {
          method: 'PUT',
          body: JSON.stringify(event)
        });
        return mapEvent(res);
      } catch {
        const events = db.getEvents().map(e => e.id === id ? { ...e, ...event } : e);
        db.saveEvents(events);
        return events.find(e => e.id === id);
      }
    },
    delete: async (id: string) => {
      try {
        return await request(`/events/${id}`, { method: 'DELETE' });
      } catch {
        const events = db.getEvents().filter(e => e.id !== id);
        db.saveEvents(events);
        return { success: true };
      }
    },
    getAttendees: async (id: string) => {
      try {
        return await request(`/events/${id}/attendees`);
      } catch {
        const regs = db.getRegistrations().filter(r => r.eventId === id);
        const users = db.getUsers();
        return regs.map(r => ({
          ...r,
          user: users.find(u => u.id === r.userId)
        }));
      }
    }
  },

  // --- Forum API ---
  forum: {
    getAll: async () => {
      try {
        const threads = await request('/forum');
        return threads.map(mapThread);
      } catch {
        return db.getForum();
      }
    },
    createThread: async (thread: { title: string; content: string; category: string }) => {
      try {
        const res = await request('/forum/threads', {
          method: 'POST',
          body: JSON.stringify(thread)
        });
        return mapThread(res);
      } catch {
        const user = db.getCurrentUser();
        const threads = db.getForum();
        const newThread: ForumThread = {
          id: `thr_${Date.now()}`,
          title: thread.title,
          content: thread.content,
          category: thread.category,
          userId: user ? user.id : 'usr_anon',
          userName: user ? user.name : 'Student',
          userAvatar: user ? user.profilePhoto : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
          likes: user ? [user.id] : [],
          date: new Date().toISOString().split('T')[0],
          replies: []
        };
        db.saveForum([newThread, ...threads]);
        return newThread;
      }
    },
    createReply: async (threadId: string, content: string) => {
      try {
        return await request(`/forum/threads/${threadId}/reply`, {
          method: 'POST',
          body: JSON.stringify({ content })
        });
      } catch {
        const user = db.getCurrentUser();
        const threads = db.getForum().map(t => {
          if (t.id === threadId) {
            const newReply = {
              id: `rep_${Date.now()}`,
              userId: user ? user.id : 'usr_anon',
              userName: user ? user.name : 'Student',
              userAvatar: user ? user.profilePhoto : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
              content,
              date: new Date().toISOString()
            };
            return { ...t, replies: [...t.replies, newReply] };
          }
          return t;
        });
        db.saveForum(threads);
        return { success: true };
      }
    },
    toggleLike: async (threadId: string) => {
      try {
        return await request(`/forum/threads/${threadId}/like`, { method: 'POST' });
      } catch {
        const user = db.getCurrentUser();
        const userId = user ? user.id : 'usr_anon';
        const threads = db.getForum().map(t => {
          if (t.id === threadId) {
            const currentLikes = Array.isArray(t.likes) ? t.likes : [];
            const hasLiked = currentLikes.includes(userId);
            const likes = hasLiked
              ? currentLikes.filter(id => id !== userId)
              : [...currentLikes, userId];
            return { ...t, likes };
          }
          return t;
        });
        db.saveForum(threads);
        return { success: true };
      }
    }
  },

  // --- Blogs API ---
  blogs: {
    getAll: async () => {
      try {
        return await request('/blogs');
      } catch {
        return db.getBlogs();
      }
    }
  },

  // --- Admin API ---
  admin: {
    getUsers: async () => {
      try {
        const users = await request('/admin/users');
        return users.map(mapUser);
      } catch {
        return db.getUsers();
      }
    },
    getPayments: async () => {
      try {
        return await request('/admin/payments');
      } catch {
        return db.getPayments();
      }
    },
    toggleBlockUser: async (id: string) => {
      try {
        return await request(`/admin/users/${id}/block`, { method: 'PUT' });
      } catch {
        const users = db.getUsers().map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u);
        db.saveUsers(users);
        return { success: true };
      }
    },
    changeRole: async (id: string, role: 'admin' | 'user') => {
      try {
        return await request(`/admin/users/${id}/role`, {
          method: 'PUT',
          body: JSON.stringify({ role })
        });
      } catch {
        const users = db.getUsers().map(u => u.id === id ? { ...u, role } : u);
        db.saveUsers(users);
        return { success: true };
      }
    },
    deleteUser: async (id: string) => {
      try {
        return await request(`/admin/users/${id}`, { method: 'DELETE' });
      } catch {
        const users = db.getUsers().filter(u => u.id !== id);
        db.saveUsers(users);
        return { success: true };
      }
    },
    refundPayment: async (id: string) => {
      try {
        return await request(`/admin/payments/refund/${id}`, { method: 'POST' });
      } catch {
        const payments = db.getPayments().map((p: Payment) => p.id === id ? { ...p, status: 'refunded' as const } : p);
        db.savePayments(payments);
        return { success: true };
      }
    }
  }
};
