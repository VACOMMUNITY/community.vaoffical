// Centralized HTTP API Client for COMMUNITY.VA

const getToken = () => localStorage.getItem('cva_token');
export const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('cva_token', token);
  } else {
    localStorage.removeItem('cva_token');
  }
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

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Network request failed.');
  }
  return data;
};

// --- Response Mapping Mappers ---
const mapUser = (u: any): any => {
  if (!u) return u;
  return {
    ...u,
    profilePhoto: u.profile_photo || u.profilePhoto,
    registeredAt: u.registered_at || u.registeredAt,
    isBlocked: u.is_blocked === true || u.is_blocked === 1 || u.isBlocked,
    couponsUsed: u.coupons_used || u.couponsUsed || [],
    wishlist: u.wishlist || u.wishlist || []
  };
};

const mapCourse = (c: any): any => {
  if (!c) return c;
  return {
    ...c,
    reviewsCount: c.reviews_count !== undefined ? c.reviews_count : c.reviewsCount
  };
};

const mapEnrollment = (e: any): any => {
  if (!e) return e;
  return {
    ...e,
    userId: e.user_id || e.userId,
    courseId: e.course_id || e.courseId,
    completedLessons: e.completed_lessons || e.completedLessons || [],
    certificateStatus: e.certificate_status || e.certificateStatus,
    certificateId: e.certificate_id || e.certificateId,
    enrolledAt: e.enrolled_at || e.enrolledAt
  };
};

const mapEvent = (evt: any): any => {
  if (!evt) return evt;
  return {
    ...evt,
    date: evt.event_date || evt.date,
    time: evt.event_time || evt.time,
    seatsTotal: evt.seats_total !== undefined ? evt.seats_total : evt.seatsTotal,
    seatsAvailable: evt.seats_available !== undefined ? evt.seats_available : evt.seatsAvailable
  };
};

const mapRegistration = (r: any): any => {
  if (!r) return r;
  return {
    ...r,
    userId: r.user_id || r.userId,
    eventId: r.event_id || r.eventId,
    paymentStatus: r.payment_status || r.paymentStatus,
    paymentId: r.payment_id || r.paymentId,
    registeredAt: r.registered_at || r.registeredAt
  };
};

const mapThread = (t: any): any => {
  if (!t) return t;
  return {
    ...t,
    userId: t.user_id || t.userId,
    userName: t.userName || t.user_name,
    userAvatar: t.userAvatar || t.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
  };
};

const mapUserList = (users: any[]): any[] => (users || []).map(mapUser);
const mapCourseList = (courses: any[]): any[] => (courses || []).map(mapCourse);
const mapEnrollmentList = (enrollments: any[]): any[] => (enrollments || []).map(mapEnrollment);
const mapEventList = (events: any[]): any[] => (events || []).map(mapEvent);
const mapRegistrationList = (registrations: any[]): any[] => (registrations || []).map(mapRegistration);
const mapThreadList = (threads: any[]): any[] => (threads || []).map(mapThread);

export const api = {
  // --- Auth API ---
  auth: {
    login: async (email: string, password: string) => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setToken(res.token);
      return mapUser(res.user);
    },
    register: async (name: string, email: string, phone: string, password: string) => {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password })
      });
      setToken(res.token);
      return mapUser(res.user);
    },
    googleLogin: async (email: string, name: string) => {
      const res = await request('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ email, name })
      });
      setToken(res.token);
      return mapUser(res.user);
    },
    getProfile: async () => {
      const user = await request('/api/auth/profile');
      return mapUser(user);
    },
    updateProfile: async (profile: { name: string; phone: string; bio: string; photo: string }) => {
      const user = await request('/api/auth/profile/update', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      return mapUser(user);
    },
    logout: () => {
      setToken(null);
    }
  },

  // --- Courses API ---
  courses: {
    getAll: async () => {
      const courses = await request('/api/courses');
      return mapCourseList(courses);
    },
    getById: async (id: string) => {
      const course = await request(`/api/courses/${id}`);
      return mapCourse(course);
    },
    enroll: async (courseId: string, amount: number, paymentMethod: string) => {
      const res = await request('/api/courses/enroll', {
        method: 'POST',
        body: JSON.stringify({ courseId, amount, paymentMethod })
      });
      return {
        ...res,
        enrollment: mapEnrollment(res.enrollment)
      };
    },
    getMyEnrollments: async () => {
      const enrollments = await request('/api/courses/enrollments/my');
      return mapEnrollmentList(enrollments);
    },
    updateProgress: async (enrollmentId: string, videoId: string, courseId: string) => {
      const enrollment = await request('/api/courses/progress', {
        method: 'PUT',
        body: JSON.stringify({ enrollmentId, videoId, courseId })
      });
      return mapEnrollment(enrollment);
    },
    toggleWishlist: async (courseId: string) => {
      return request('/api/courses/wishlist', {
        method: 'POST',
        body: JSON.stringify({ courseId })
      });
    },
    // Admin CRUD
    add: async (course: { title: string; description: string; price: number; instructor: string; category: string; thumbnail?: string }) => {
      const res = await request('/api/courses/add', {
        method: 'POST',
        body: JSON.stringify(course)
      });
      return mapCourse(res);
    },
    update: async (id: string, course: { title: string; description: string; price: number; instructor: string; category: string; thumbnail?: string }) => {
      const res = await request(`/api/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(course)
      });
      return mapCourse(res);
    },
    delete: async (id: string) => {
      return request(`/api/courses/${id}`, {
        method: 'DELETE'
      });
    },
    addVideo: async (courseId: string, video: { title: string; duration: string; videoUrl?: string }) => {
      return request(`/api/courses/${courseId}/video`, {
        method: 'POST',
        body: JSON.stringify(video)
      });
    }
  },

  // --- Events API ---
  events: {
    getAll: async () => {
      const events = await request('/api/events');
      return mapEventList(events);
    },
    getById: async (id: string) => {
      const event = await request(`/api/events/${id}`);
      return mapEvent(event);
    },
    register: async (eventId: string, amount: number, paymentMethod: string) => {
      const res = await request('/api/events/register', {
        method: 'POST',
        body: JSON.stringify({ eventId, amount, paymentMethod })
      });
      return {
        ...res,
        registration: mapRegistration(res.registration)
      };
    },
    getMyRegistrations: async () => {
      const regs = await request('/api/events/registrations/my');
      return mapRegistrationList(regs);
    },
    cancelRegistration: async (registrationId: string) => {
      return request(`/api/events/registrations/cancel/${registrationId}`, {
        method: 'DELETE'
      });
    },
    // Admin CRUD
    add: async (event: { title: string; description: string; date: string; time: string; venue: string; fees: number; seatsTotal: number; category: string; banner?: string }) => {
      const res = await request('/api/events/add', {
        method: 'POST',
        body: JSON.stringify(event)
      });
      return mapEvent(res);
    },
    update: async (id: string, event: { title: string; description: string; date: string; time: string; venue: string; fees: number; seatsTotal: number; category: string; banner?: string }) => {
      const res = await request(`/api/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(event)
      });
      return mapEvent(res);
    },
    delete: async (id: string) => {
      return request(`/api/events/${id}`, {
        method: 'DELETE'
      });
    },
    getAttendees: async (id: string) => {
      return request(`/api/events/${id}/attendees`);
    }
  },

  // --- Forum API ---
  forum: {
    getAll: async () => {
      const threads = await request('/api/forum');
      return mapThreadList(threads);
    },
    createThread: async (thread: { title: string; content: string; category: string }) => {
      const res = await request('/api/forum/threads', {
        method: 'POST',
        body: JSON.stringify(thread)
      });
      return mapThread(res);
    },
    createReply: async (threadId: string, content: string) => {
      return request(`/api/forum/threads/${threadId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });
    },
    toggleLike: async (threadId: string) => {
      return request(`/api/forum/threads/${threadId}/like`, {
        method: 'POST'
      });
    }
  },

  // --- Blog API ---
  blogs: {
    getAll: async () => {
      return request('/api/blogs');
    },
    getById: async (id: string) => {
      return request(`/api/blogs/${id}`);
    }
  },

  // --- Admin Console API ---
  admin: {
    getUsers: async () => {
      const users = await request('/api/admin/users');
      return mapUserList(users);
    },
    toggleBlockUser: async (id: string) => {
      return request(`/api/admin/users/${id}/block`, {
        method: 'PUT'
      });
    },
    changeRole: async (id: string, role: 'admin' | 'user') => {
      return request(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
    },
    deleteUser: async (id: string) => {
      return request(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });
    },
    getPayments: async () => {
      return request('/api/admin/payments');
    },
    refundPayment: async (id: string) => {
      return request(`/api/admin/payments/refund/${id}`, {
        method: 'POST'
      });
    }
  }
};
