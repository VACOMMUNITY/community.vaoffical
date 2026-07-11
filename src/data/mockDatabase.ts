// Types and Database Interfaces

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  profilePhoto: string;
  bio: string;
  registeredAt: string;
  isBlocked: boolean;
  wishlist: string[]; // courseIds
  couponsUsed: string[]; // coupon codes
}

export interface Event {
  id: string;
  title: string;
  description: string;
  banner: string;
  date: string;
  time: string;
  venue: string;
  fees: number;
  seatsTotal: number;
  seatsAvailable: number;
  category: string;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  paymentStatus: 'completed' | 'pending';
  paymentId: string;
  registeredAt: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
}

export interface CourseResource {
  name: string;
  url: string;
  type: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  instructor: string;
  videos: VideoLesson[];
  resources: CourseResource[];
  category: string;
  rating: number;
  reviewsCount: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // 0 to 100
  completedLessons: string[]; // videoLessonIds
  certificateStatus: 'not_earned' | 'earned';
  certificateId?: string;
  enrolledAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  paymentMethod: string;
  status: 'success' | 'refunded';
  date: string;
  itemType: 'course' | 'event';
  itemId: string;
  itemName: string;
}

export interface ForumReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  date: string;
}

export interface ForumThread {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  content: string;
  category: string;
  likes: string[]; // userIds
  replies: ForumReply[];
  date: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  banner: string;
  author: string;
  date: string;
  reads: number;
  likes: number;
}

// Initial Seed Data
const initialUsers: User[] = [
  {
    id: 'usr_1',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    phone: '+1 555-0199',
    role: 'admin',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    bio: 'Founder and program manager at COMMUNITY.VA. Passionate about empowering students.',
    registeredAt: '2026-01-15T09:30:00Z',
    isBlocked: false,
    wishlist: [],
    couponsUsed: []
  },
  {
    id: 'usr_2',
    name: 'Alex Mercer',
    email: 'alex@example.com',
    phone: '+1 555-0144',
    role: 'user',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    bio: 'Computer Science undergraduate looking to improve presentation and communication skills.',
    registeredAt: '2026-03-20T14:15:00Z',
    isBlocked: false,
    wishlist: [],
    couponsUsed: []
  }
];

const initialEvents: Event[] = [
  {
    id: 'evt_1',
    title: 'The Art of Negotiating Your First Salary',
    description: 'Learn the principles of negotiation, research market rates, handle initial offers, and script your counter-proposals with industry mentors.',
    banner: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
    date: '2026-06-25',
    time: '18:00 - 20:00',
    venue: 'Zoom Online Meeting',
    fees: 15,
    seatsTotal: 50,
    seatsAvailable: 45,
    category: 'Career Prep'
  },
  {
    id: 'evt_2',
    title: 'Demystifying Non-Technical Roles in Tech',
    description: 'A panel discussion with Product Managers, Scrum Masters, and UX researchers sharing how they entered tech without coding backgrounds.',
    banner: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800',
    date: '2026-07-12',
    time: '15:00 - 17:30',
    venue: 'Vibrant Hub, New York & Hybrid',
    fees: 0,
    seatsTotal: 150,
    seatsAvailable: 135,
    category: 'Networking'
  },
  {
    id: 'evt_3',
    title: 'Public Speaking BootCamp: Overcome Stage Fright',
    description: 'An intensive, hands-on workshop focused on conquering performance anxiety, voice modulation, and dynamic body language.',
    banner: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800',
    date: '2026-08-02',
    time: '10:00 - 16:00',
    venue: 'Convention Center, Hall B',
    fees: 49,
    seatsTotal: 30,
    seatsAvailable: 28,
    category: 'Public Speaking'
  }
];

const initialCourses: Course[] = [
  {
    id: 'crs_1',
    title: 'Public Speaking & Influential Presentation Mastery',
    description: 'Overcome fear and craft presentations that capture and influence your audience. Learn structure, vocal variety, and dynamic delivery techniques.',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
    price: 39,
    instructor: 'David Vance (Toastmaster Champion)',
    category: 'Public Speaking',
    rating: 4.8,
    reviewsCount: 124,
    videos: [
      { id: 'v1_1', title: '1. Introduction to Public Speaking', duration: '08:45', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'v1_2', title: '2. Deconstructing Stage Fright', duration: '12:30', videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
      { id: 'v1_3', title: '3. The Speech Structure Blueprint', duration: '15:10', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'v1_4', title: '4. Vocal Variety & Hand Gestures', duration: '11:20', videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
      { id: 'v1_5', title: '5. Handling Q&As Under Pressure', duration: '09:15', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
    ],
    resources: [
      { name: 'Speech Outline Worksheet.pdf', url: '#', type: 'PDF' },
      { name: 'Presentation Performance Checklist.pdf', url: '#', type: 'PDF' }
    ]
  },
  {
    id: 'crs_2',
    title: 'Resume Building & High-Impact Interview Strategy',
    description: 'Transform your resume into an ATS-friendly, recruiter-grabbing showcase. Master behavior-based answers (STAR method) and negotiation strategies.',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600',
    price: 29,
    instructor: 'Clara Oswald (Ex-HR Google)',
    category: 'Career Prep',
    rating: 4.9,
    reviewsCount: 215,
    videos: [
      { id: 'v2_1', title: '1. Decoding Applicant Tracking Systems (ATS)', duration: '10:15', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'v2_2', title: '2. Framing Experience using STAR Framework', duration: '14:50', videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
      { id: 'v2_3', title: '3. Common Behavioral Interview Prompts', duration: '16:20', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'v2_4', title: '4. The Psychology of Salary Negotiating', duration: '13:10', videoUrl: 'https://www.w3schools.com/html/movie.mp4' }
    ],
    resources: [
      { name: 'ATS Friendly Resume Template.docx', url: '#', type: 'DOCX' },
      { name: 'STAR Interview Cheat Sheet.pdf', url: '#', type: 'PDF' }
    ]
  },
  {
    id: 'crs_3',
    title: 'Emotional Intelligence & Leadership Foundations',
    description: 'Develop the emotional maturity, empathy, and active listening capabilities needed to manage conflicts and effectively lead high-performing teams.',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
    price: 49,
    instructor: 'Marcus Aurelius (Management Consultant)',
    category: 'Leadership',
    rating: 4.7,
    reviewsCount: 98,
    videos: [
      { id: 'v3_1', title: '1. Pillars of Emotional Intelligence', duration: '09:30', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'v3_2', title: '2. The Discipline of Active Listening', duration: '11:15', videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
      { id: 'v3_3', title: '3. Strategic Conflict De-escalation', duration: '14:40', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'v3_4', title: '4. Building a Culture of Trust', duration: '12:05', videoUrl: 'https://www.w3schools.com/html/movie.mp4' }
    ],
    resources: [
      { name: 'EI Leadership Assessment Grid.pdf', url: '#', type: 'PDF' }
    ]
  },
  {
    id: 'crs_4',
    title: 'LinkedIn Personal Branding & Networking Secrets',
    description: 'Learn how to optimize your LinkedIn profile, create viral industry content, and network authentically with senior corporate leaders.',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600',
    price: 19,
    instructor: 'Jessica Alba (Brand Strategist)',
    category: 'Personal Development',
    rating: 4.6,
    reviewsCount: 82,
    videos: [
      { id: 'v4_1', title: '1. The Perfect Profile Makeover', duration: '12:00', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'v4_2', title: '2. Reaching Out: Cold Emailing Scripting', duration: '10:45', videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
      { id: 'v4_3', title: '3. Content Engine: What to Post & When', duration: '13:20', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
    ],
    resources: [
      { name: 'Cold Outreach Templates.pdf', url: '#', type: 'PDF' },
      { name: 'LinkedIn Optimization Worksheet.pdf', url: '#', type: 'PDF' }
    ]
  }
];

const initialRegistrations: Registration[] = [
  {
    id: 'reg_1',
    userId: 'usr_2',
    eventId: 'evt_1',
    paymentStatus: 'completed',
    paymentId: 'pay_evt_1',
    registeredAt: '2026-06-05T10:12:00Z'
  }
];

const initialEnrollments: Enrollment[] = [
  {
    id: 'enr_1',
    userId: 'usr_2',
    courseId: 'crs_1',
    progress: 40,
    completedLessons: ['v1_1', 'v1_2'],
    certificateStatus: 'not_earned',
    enrolledAt: '2026-06-01T15:00:00Z'
  }
];

const initialPayments: Payment[] = [
  {
    id: 'pay_evt_1',
    userId: 'usr_2',
    userName: 'Alex Mercer',
    userEmail: 'alex@example.com',
    amount: 15,
    paymentMethod: 'UPI',
    status: 'success',
    date: '2026-06-05T10:12:00Z',
    itemType: 'event',
    itemId: 'evt_1',
    itemName: 'The Art of Negotiating Your First Salary'
  },
  {
    id: 'pay_crs_1',
    userId: 'usr_2',
    userName: 'Alex Mercer',
    userEmail: 'alex@example.com',
    amount: 39,
    paymentMethod: 'Credit Card',
    status: 'success',
    date: '2026-06-01T15:00:00Z',
    itemType: 'course',
    itemId: 'crs_1',
    itemName: 'Public Speaking & Influential Presentation Mastery'
  }
];

const initialForum: ForumThread[] = [
  {
    id: 'th_1',
    userId: 'usr_2',
    userName: 'Alex Mercer',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    title: 'How to deal with stage fright in online Zoom meetings?',
    content: 'Hi community! I find myself getting extremely nervous even during Zoom presentations where I do not see the audience faces directly. Any advice on vocal exercises or calming techniques before jumping in?',
    category: 'Public Speaking',
    likes: ['usr_1'],
    date: '2026-06-10T12:00:00Z',
    replies: [
      {
        id: 'rep_1',
        userId: 'usr_1',
        userName: 'Sarah Connor (Admin)',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
        content: 'Try speaking to a specific object near your camera lens! It grounds your vision and keeps you looking into the camera. Also, box breathing (4s in, 4s hold, 4s out, 4s hold) for 2 minutes before the meeting works wonders.',
        date: '2026-06-10T14:30:00Z'
      }
    ]
  },
  {
    id: 'th_2',
    userId: 'usr_1',
    userName: 'Sarah Connor',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    title: 'Welcome to COMMUNITY.VA Discussion Space!',
    content: 'Welcome everyone! This forum is a space to ask questions, share tips on public speaking, CV writing, career planning, leadership and support each other. Introduce yourself below!',
    category: 'General Discussion',
    likes: ['usr_2'],
    date: '2026-06-01T09:00:00Z',
    replies: [
      {
        id: 'rep_2',
        userId: 'usr_2',
        userName: 'Alex Mercer',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
        content: 'Excited to be here! Looking forward to learning from all the workshops.',
        date: '2026-06-01T11:15:00Z'
      }
    ]
  }
];

const initialBlogs: BlogArticle[] = [
  {
    id: 'blg_1',
    title: '5 Soft Skills that Technical Interviewers Secretly Look For',
    excerpt: 'While coding and logic are critical, recruiters hire candidates who show exceptional communication, collaboration, and learning agility.',
    content: '### 1. Active Listening during Problem Solving\nWhen an interviewer gives you a hint or points out an edge case, they are looking to see how you receive feedback. Do you double down, or do you listen, process, and adjust your solution?\n\n### 2. Structured Communication\nCan you explain complex algorithms simply? Try using the "Top-Down" approach: summarize your goal first, outline the high-level steps, and then dive into details.\n\n### 3. Humility & Teachability\nIt is better to admit "I am not 100% sure about this syntax, but I would approach it like..." than trying to bluff your way through. Honesty builds trust.',
    banner: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    author: 'Clara Oswald',
    date: '2026-06-08',
    reads: 432,
    likes: 87
  },
  {
    id: 'blg_2',
    title: 'The Blueprint of an ATS-Compliant Professional Resume',
    excerpt: 'Over 70% of resumes are filtered out before reaching a human. Here is how to format and phrase your resume for success.',
    content: '### Formatting Rules:\n- Avoid text boxes, tables, and graphic elements which can confuse ATS parsers.\n- Use standard web fonts (Arial, Calibri, Helvetica).\n- Export as PDF or DOCX.\n\n### Action-Oriented Phrasing:\nInstead of writing "Responsible for managing a team...", write: **"Led a team of 4 interns to deliver a client management system, reducing query latency by 15%."** Use metrics whenever possible.',
    banner: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    author: 'Sarah Connor',
    date: '2026-05-28',
    reads: 610,
    likes: 132
  }
];

// LocalStorage Persistence Wrapper

const loadData = <T>(key: string, initialData: T): T => {
  const data = localStorage.getItem(`cva_${key}`);
  if (!data) {
    localStorage.setItem(`cva_${key}`, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialData;
  }
};

const saveData = <T>(key: string, data: T): void => {
  localStorage.setItem(`cva_${key}`, JSON.stringify(data));
  // Dispatch a custom event to notify all components of updates
  window.dispatchEvent(new Event('db-update'));
};

// Database Access Objects (State Manager)
export const db = {
  getUsers: (): User[] => loadData('users', initialUsers),
  saveUsers: (data: User[]) => saveData('users', data),

  getEvents: (): Event[] => loadData('events', initialEvents),
  saveEvents: (data: Event[]) => saveData('events', data),

  getRegistrations: (): Registration[] => loadData('registrations', initialRegistrations),
  saveRegistrations: (data: Registration[]) => saveData('registrations', data),

  getCourses: (): Course[] => loadData('courses', initialCourses),
  saveCourses: (data: Course[]) => saveData('courses', data),

  getEnrollments: (): Enrollment[] => loadData('enrollments', initialEnrollments),
  saveEnrollments: (data: Enrollment[]) => saveData('enrollments', data),

  getPayments: (): Payment[] => loadData('payments', initialPayments),
  savePayments: (data: Payment[]) => saveData('payments', data),

  getForum: (): ForumThread[] => loadData('forum', initialForum),
  saveForum: (data: ForumThread[]) => saveData('forum', data),

  getBlogs: (): BlogArticle[] => loadData('blogs', initialBlogs),
  saveBlogs: (data: BlogArticle[]) => saveData('blogs', data),

  // Session user storage (Mock Auth)
  getCurrentUser: (): User | null => {
    const usr = localStorage.getItem('cva_current_user');
    if (!usr) return null;
    try {
      const parsed = JSON.parse(usr);
      // Ensure we get the latest data from users list
      const latest = db.getUsers().find(u => u.id === parsed.id);
      return latest || parsed;
    } catch {
      return null;
    }
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('cva_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cva_current_user');
    }
    window.dispatchEvent(new Event('db-update'));
  }
};

// Coupons Database Simulation
export const coupons = [
  { code: 'WELCOME50', discountPercent: 50, desc: '50% Off for new members' },
  { code: 'SOFT20', discountPercent: 20, desc: '20% Off all courses' },
  { code: 'FREEPASS', discountPercent: 100, desc: '100% Off events/courses (Limited)' }
];
