import { db, type User, type Course, type Event, type ForumThread, type Enrollment, type Registration, type Payment, type EventCategory } from './mockDatabase';

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

import { supabase, isSupabaseConfigured, isAuthorizedAdmin } from '../lib/supabase';


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
    deadline: evt.deadline || undefined,
    eventType: evt.event_type || evt.eventType || 'offline',
    status: evt.status || 'published'
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
    status: r.status || 'pending',
    attended: !!(r.attended || r.is_attended),
    attendedAt: r.attended_at || r.attendedAt,
    checkInCode: r.check_in_code || r.checkInCode || (r.id ? r.id.substring(r.id.length - 6).toUpperCase() : 'PASS'),
    certificateIssued: !!(r.certificate_issued || r.certificateIssued),
    certificateId: r.certificate_id || r.certificateId,
    certificateIssuedAt: r.certificate_issued_at || r.certificateIssuedAt
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
  // --- Auth API (Supabase Production Authentication) ---
  auth: {
    login: async (email: string, password?: string): Promise<User> => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!password) {
        throw new Error('Please enter your password.');
      }

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });
        if (error) {
          throw new Error(error.message);
        }

        const sbUser = data.user;
        const isAdmin = isAuthorizedAdmin(sbUser.email, sbUser.app_metadata?.role);
        const users = db.getUsers();
        let userObj = users.find(u => u.email.toLowerCase() === normalizedEmail);

        if (!userObj) {
          userObj = {
            id: sbUser.id,
            name: sbUser.user_metadata?.full_name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            phone: sbUser.user_metadata?.phone || '+91 7416201359',
            role: isAdmin ? 'admin' : 'user',
            profilePhoto: isAdmin 
              ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
            bio: 'Member of COMMUNITY.VA learning cohort.',
            registeredAt: sbUser.created_at || new Date().toISOString(),
            isBlocked: false,
            wishlist: [],
            couponsUsed: []
          };
          db.saveUsers([...users, userObj]);
        } else {
          if (userObj.isBlocked) {
            await supabase.auth.signOut();
            throw new Error('This account has been deactivated. Please contact support.');
          }
          if (isAdmin && userObj.role !== 'admin') {
            userObj.role = 'admin';
            db.saveUsers(users.map(u => u.id === userObj!.id ? userObj! : u));
          }
        }

        setToken(data.session?.access_token || 'sb_active_session');
        db.setCurrentUser(userObj);
        return userObj;
      }

      // If remote backend server is running, use it
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
        throw new Error(err.message || 'Authentication failed. Please verify your credentials or check Supabase configuration.');
      }
    },

    adminLogin: async (email: string, password?: string): Promise<User> => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!isAuthorizedAdmin(normalizedEmail)) {
        throw new Error('Access Denied: Only approved administrator email accounts can access the Admin Dashboard.');
      }
      if (!password) {
        throw new Error('Please enter your administrator password.');
      }

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });
        if (error) {
          throw new Error(error.message);
        }

        const sbUser = data.user;
        if (!isAuthorizedAdmin(sbUser.email, sbUser.app_metadata?.role)) {
          await supabase.auth.signOut();
          throw new Error('Access Denied: Your account does not possess administrator privileges.');
        }

        const users = db.getUsers();
        let adminObj = users.find(u => u.email.toLowerCase() === normalizedEmail);
        if (!adminObj) {
          adminObj = {
            id: sbUser.id,
            name: sbUser.user_metadata?.full_name || 'COMMUNITY.VA Administrator',
            email: normalizedEmail,
            phone: sbUser.user_metadata?.phone || '+91 7416201359',
            role: 'admin',
            profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
            bio: 'Official Administrator and Director at COMMUNITY.VA.',
            registeredAt: sbUser.created_at || new Date().toISOString(),
            isBlocked: false,
            wishlist: [],
            couponsUsed: []
          };
          db.saveUsers([...users, adminObj]);
        } else {
          adminObj.role = 'admin';
          db.saveUsers(users.map(u => u.id === adminObj!.id ? adminObj! : u));
        }

        setToken(data.session?.access_token || 'sb_admin_token');
        db.setCurrentUser(adminObj);
        return adminObj;
      }

      // Check backend API fallback
      try {
        const res = await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: normalizedEmail, password })
        });
        const mapped = mapUser(res.user);
        if (mapped.role !== 'admin' && !isAuthorizedAdmin(mapped.email)) {
          throw new Error('Access Denied: Account is not an administrator.');
        }
        setToken(res.token);
        db.setCurrentUser(mapped);
        return mapped;
      } catch (err: any) {
        throw new Error(err.message || 'Admin authentication failed.');
      }
    },

    register: async (name: string, email: string, phone: string, password?: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              phone: phone.trim()
            }
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        const sbUser = data.user;
        const isAdmin = isAuthorizedAdmin(normalizedEmail);
        const newUser: User = {
          id: sbUser?.id || `usr_${Date.now()}`,
          name: name.trim() || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          phone: phone.trim(),
          role: isAdmin ? 'admin' : 'user',
          profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
          bio: 'New student enrolled in COMMUNITY.VA career accelerator programs.',
          registeredAt: new Date().toISOString(),
          isBlocked: false,
          wishlist: [],
          couponsUsed: []
        };

        const users = db.getUsers().filter(u => u.email.toLowerCase() !== normalizedEmail);
        db.saveUsers([...users, newUser]);

        // If session was granted immediately (email confirmation disabled in Supabase project)
        if (data.session) {
          setToken(data.session.access_token);
          db.setCurrentUser(newUser);
        }

        return {
          user: newUser,
          session: data.session,
          requiresEmailVerification: !data.session
        };
      }

      // Backend API fallback
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email: normalizedEmail, phone, password })
      });
      setToken(res.token);
      const mapped = mapUser(res.user);
      db.setCurrentUser(mapped);
      return { user: mapped, session: res.token, requiresEmailVerification: false };
    },

    googleLogin: async () => {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) {
          throw new Error(error.message);
        }
        return data;
      }
      throw new Error('Google OAuth requires Supabase project configuration in .env (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).');
    },

    forgotPassword: async (email: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/`
        });
        if (error) {
          throw new Error(error.message);
        }
        return data;
      }

      try {
        return await request('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: normalizedEmail })
        });
      } catch {
        return { success: true, message: 'Password reset link sent.' };
      }
    },

    logout: async () => {
      if (isSupabaseConfigured()) {
        try {
          await supabase.auth.signOut();
        } catch {}
      }
      setToken(null);
      db.setCurrentUser(null);
    },

    getProfile: async (): Promise<User> => {
      if (isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const sbUser = session.user;
          const isAdmin = isAuthorizedAdmin(sbUser.email, sbUser.app_metadata?.role);
          const users = db.getUsers();
          let userObj = users.find(u => u.email.toLowerCase() === sbUser.email?.toLowerCase());

          if (!userObj) {
            userObj = {
              id: sbUser.id,
              name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Student',
              email: sbUser.email || '',
              phone: sbUser.user_metadata?.phone || '+91 7416201359',
              role: isAdmin ? 'admin' : 'user',
              profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
              bio: 'Active member of COMMUNITY.VA.',
              registeredAt: sbUser.created_at || new Date().toISOString(),
              isBlocked: false,
              wishlist: [],
              couponsUsed: []
            };
            db.saveUsers([...users, userObj]);
          }

          db.setCurrentUser(userObj);
          return userObj;
        }
      }

      try {
        const user = await request('/auth/profile');
        const mapped = mapUser(user);
        db.setCurrentUser(mapped);
        return mapped;
      } catch {
        const local = db.getCurrentUser();
        if (local) return local;
        throw new Error('No active user session found.');
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
      seatsTotal: number; category: string; banner?: string;
      eventType?: 'online' | 'offline' | 'hybrid';
      status?: 'draft' | 'published' | 'closed';
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
          banner: event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
          eventType: event.eventType || 'offline',
          status: event.status || 'published'
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
    },
    toggleAttendance: async (registrationId: string, attended: boolean) => {
      const regs = db.getRegistrations().map(r => {
        if (r.id === registrationId) {
          return {
            ...r,
            attended,
            attendedAt: attended ? new Date().toISOString() : undefined
          };
        }
        return r;
      });
      db.saveRegistrations(regs);
      return { success: true };
    },
    checkInByCode: async (codeOrId: string) => {
      const trimmed = codeOrId.trim().toLowerCase();
      const regs = db.getRegistrations();
      const target = regs.find(r => 
        (r.id && r.id.toLowerCase() === trimmed) ||
        (r.checkInCode && r.checkInCode.toLowerCase() === trimmed) ||
        (r.phone && r.phone.replace(/\D/g, '').endsWith(trimmed.replace(/\D/g, '')))
      );
      if (!target) {
        throw new Error('No registration found matching the entered ticket ID / phone.');
      }
      const updated = regs.map(r => {
        if (r.id === target.id) {
          return {
            ...r,
            attended: true,
            attendedAt: new Date().toISOString()
          };
        }
        return r;
      });
      db.saveRegistrations(updated);
      return target;
    },
    issueCertificate: async (registrationId: string) => {
      const certId = `CVA-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const regs = db.getRegistrations().map(r => {
        if (r.id === registrationId) {
          return {
            ...r,
            certificateIssued: true,
            certificateId: certId,
            certificateIssuedAt: new Date().toISOString()
          };
        }
        return r;
      });
      db.saveRegistrations(regs);
      return { certificateId: certId };
    },
    issueBatchCertificates: async (eventId: string) => {
      let count = 0;
      const regs = db.getRegistrations().map(r => {
        if (r.eventId === eventId && r.attended && !r.certificateIssued) {
          count++;
          return {
            ...r,
            certificateIssued: true,
            certificateId: `CVA-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            certificateIssuedAt: new Date().toISOString()
          };
        }
        return r;
      });
      db.saveRegistrations(regs);
      return { count };
    }
  },

  // --- Event Categories API ---
  categories: {
    getAll: async () => {
      return db.getCategories();
    },
    add: async (category: { name: string; description?: string; color?: string; icon?: string }) => {
      const existing = db.getCategories();
      const newCat: EventCategory = {
        id: `cat_${Date.now()}`,
        name: category.name.trim(),
        description: category.description || '',
        icon: category.icon || 'Sparkles',
        color: category.color || 'blue',
        isCustom: true
      };
      db.saveCategories([...existing, newCat]);
      return newCat;
    },
    delete: async (id: string) => {
      const existing = db.getCategories().filter(c => c.id !== id);
      db.saveCategories(existing);
      return { success: true };
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
