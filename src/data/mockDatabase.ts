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

export interface EventFees {
  earlyBird?: number;
  regular: number;
  spotEntry?: number;
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
  feesTier?: EventFees;
  qrCode?: string;
  deadline?: string;
  seatsTotal: number;
  seatsAvailable: number;
  category: string;
  eventType?: 'online' | 'offline' | 'hybrid';
  status?: 'draft' | 'published' | 'closed';
}

export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isCustom?: boolean;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  paymentStatus: 'completed' | 'pending' | 'rejected';
  paymentId: string;
  registeredAt: string;
  fullName?: string;
  email?: string;
  phone?: string;
  collegeName?: string;
  branch?: string;
  year?: string;
  selectedTier?: string;
  passTier?: string;
  amountPaid?: number;
  paymentScreenshot?: string;
  confirmedPayment?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  attended?: boolean;
  attendedAt?: string;
  checkInCode?: string;
  certificateIssued?: boolean;
  certificateId?: string;
  certificateIssuedAt?: string;
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
  status: 'success' | 'refunded' | 'pending';
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

export interface CampusAmbassador {
  id: string;
  name: string;
  college: string;
  city: string;
  avatar: string;
  points: number;
  referralsCount: number;
  tier: 'Gold' | 'Platinum' | 'Diamond';
  joinedAt: string;
  status: 'active' | 'pending';
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  tag: string;
  description: string;
  points: number;
  deadline: string;
  participantsCount: number;
  icon: string;
  deliverable: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  college: string;
  points: number;
  avatar: string;
  badge: string;
}

export interface CollegePartner {
  id: string;
  name: string;
  shortName: string;
  location: string;
  logo: string;
  studentsTrained: number;
  workshopsHosted: number;
  mouStatus: 'Active Partner' | 'MOU Signed' | 'Chapter Active';
}

export interface CareerRole {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  college: string;
  rolePlaced: string;
  company: string;
  companyLogo?: string;
  quote: string;
  avatar: string;
  rating: number;
  courseTaken: string;
}

// Initial Seed Data
const initialUsers: User[] = [
  {
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
  },
  {
    id: 'usr_1',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    phone: '+91 7416201359',
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
    fees: 199,
    feesTier: { earlyBird: 149, regular: 199, spotEntry: 299 },
    qrCode: '/upi-qr.jpg',
    deadline: '2026-06-24',
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
    venue: 'Vibrant Hub, Hyderabad & Hybrid',
    fees: 0,
    feesTier: { earlyBird: 0, regular: 0, spotEntry: 99 },
    qrCode: '/upi-qr.jpg',
    deadline: '2026-07-11',
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
    venue: 'Convention Center, Hall B, Hyderabad',
    fees: 299,
    feesTier: { earlyBird: 199, regular: 299, spotEntry: 499 },
    qrCode: '/upi-qr.jpg',
    deadline: '2026-08-01',
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
      { name: 'Vocal Warmups Audio Guide.mp3', url: '#', type: 'Audio' }
    ]
  },
  {
    id: 'crs_2',
    title: 'Mastering the Technical & Behavioral Interview',
    description: 'Ace every behavioral round using the STAR framework. Decode recruiter psychology and turn difficult questions into compelling career narratives.',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    price: 29,
    instructor: 'Elena Rostova (Ex-FAANG Recruiter)',
    category: 'Career Prep',
    rating: 4.9,
    reviewsCount: 210,
    videos: [
      { id: 'v2_1', title: '1. Unpacking the STAR Method', duration: '14:20', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'v2_2', title: '2. Telling Your Story with Impact', duration: '11:00', videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
      { id: 'v2_3', title: '3. Answering "What Is Your Weakness?"', duration: '07:40', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'v2_4', title: '4. Questions to Ask Your Interviewer', duration: '10:15', videoUrl: 'https://www.w3schools.com/html/movie.mp4' }
    ],
    resources: [
      { name: 'STAR Framework Cheat Sheet.pdf', url: '#', type: 'PDF' },
      { name: 'Top 50 Behavioral Questions.pdf', url: '#', type: 'PDF' }
    ]
  },
  {
    id: 'crs_3',
    title: 'Leadership & Emotional Intelligence for High Performers',
    description: 'Cultivate empathy, active listening, and conflict resolution tactics essential for moving from individual contributor to leadership.',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600',
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
    registeredAt: '2026-06-05T10:12:00Z',
    fullName: 'Alex Mercer',
    email: 'alex@example.com',
    phone: '+91 98765 43210',
    collegeName: 'Osmania University, Hyderabad',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    selectedTier: 'Early Bird',
    amountPaid: 149,
    confirmedPayment: true,
    status: 'approved'
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

export const initialAmbassadors: CampusAmbassador[] = [
  {
    id: 'amb_1',
    name: 'Rohan Deshmukh',
    college: 'IIT Bombay',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    points: 4850,
    referralsCount: 42,
    tier: 'Diamond',
    joinedAt: '2026-02-10',
    status: 'active'
  },
  {
    id: 'amb_2',
    name: 'Ananya Sharma',
    college: 'Delhi University (SRCC)',
    city: 'New Delhi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    points: 3920,
    referralsCount: 35,
    tier: 'Platinum',
    joinedAt: '2026-03-01',
    status: 'active'
  },
  {
    id: 'amb_3',
    name: 'Karthik Raja',
    college: 'Anna University',
    city: 'Chennai',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    points: 3100,
    referralsCount: 28,
    tier: 'Gold',
    joinedAt: '2026-03-15',
    status: 'active'
  },
  {
    id: 'amb_4',
    name: 'Meera Iyer',
    college: 'BITS Pilani',
    city: 'Pilani',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    points: 2750,
    referralsCount: 22,
    tier: 'Gold',
    joinedAt: '2026-04-02',
    status: 'active'
  }
];

export const initialChallenges: WeeklyChallenge[] = [
  {
    id: 'ch_1',
    title: 'The 60-Second Elevator Pitch',
    tag: 'Public Speaking',
    description: 'Record a 60-second video introducing yourself, your non-technical strengths, and how you solve problems using the Hook-Story-Offer formula.',
    points: 500,
    deadline: 'Sunday, 11:59 PM',
    participantsCount: 342,
    icon: 'Mic',
    deliverable: 'Unlisted YouTube or Loom Link'
  },
  {
    id: 'ch_2',
    title: 'ATS Resume Audit Challenge',
    tag: 'Career Prep',
    description: 'Format your 1-page resume using active leadership verbs and metrics. Review 2 peer submissions and provide structured STAR feedback.',
    points: 350,
    deadline: 'Friday, 6:00 PM',
    participantsCount: 512,
    icon: 'FileText',
    deliverable: 'PDF Upload + Peer Review Form'
  },
  {
    id: 'ch_3',
    title: 'Conflict Resolution Roleplay',
    tag: 'Leadership',
    description: 'Submit your step-by-step strategy for handling an underperforming teammate during a tight capstone deadline without escalating to professors.',
    points: 400,
    deadline: 'Next Tuesday',
    participantsCount: 219,
    icon: 'Shield',
    deliverable: '300-word Case Analysis'
  }
];

export const initialLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Rohan Deshmukh', college: 'IIT Bombay', points: 4850, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120', badge: 'Diamond Ambassador' },
  { rank: 2, name: 'Ananya Sharma', college: 'Delhi University', points: 3920, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120', badge: 'Master Orator' },
  { rank: 3, name: 'Karthik Raja', college: 'Anna University', points: 3100, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120', badge: 'Growth Lead' },
  { rank: 4, name: 'Priya Nair', college: 'NIT Trichy', points: 2980, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', badge: 'STAR Interviewer' },
  { rank: 5, name: 'Meera Iyer', college: 'BITS Pilani', points: 2750, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120', badge: 'Negotiation Ace' }
];

export const initialCollegePartners: CollegePartner[] = [
  { id: 'col_1', name: 'Indian Institute of Technology Bombay', shortName: 'IIT Bombay', location: 'Mumbai, Maharashtra', logo: '🏛️', studentsTrained: 4200, workshopsHosted: 18, mouStatus: 'Active Partner' },
  { id: 'col_2', name: 'Delhi University (Faculty of Management & Commerce)', shortName: 'Delhi University', location: 'New Delhi', logo: '🎓', studentsTrained: 6800, workshopsHosted: 26, mouStatus: 'MOU Signed' },
  { id: 'col_3', name: 'National Institute of Technology Trichy', shortName: 'NIT Trichy', location: 'Tiruchirappalli, Tamil Nadu', logo: '⚡', studentsTrained: 3100, workshopsHosted: 14, mouStatus: 'Active Partner' },
  { id: 'col_4', name: 'Birla Institute of Technology and Science', shortName: 'BITS Pilani', location: 'Pilani, Rajasthan', logo: '🔬', studentsTrained: 2900, workshopsHosted: 12, mouStatus: 'Chapter Active' },
  { id: 'col_5', name: 'Vellore Institute of Technology', shortName: 'VIT Vellore', location: 'Vellore, Tamil Nadu', logo: '🚀', studentsTrained: 5400, workshopsHosted: 22, mouStatus: 'MOU Signed' },
  { id: 'col_6', name: 'Symbiosis International University', shortName: 'Symbiosis Pune', location: 'Pune, Maharashtra', logo: '🌟', studentsTrained: 3600, workshopsHosted: 16, mouStatus: 'Active Partner' }
];

export const initialCareerRoles: CareerRole[] = [
  {
    id: 'car_1',
    title: 'Lead Curriculum Architect (Soft Skills)',
    department: 'Pedagogy & Learning',
    location: 'Hyderabad, Telangana / Remote',
    type: 'Full-time',
    experience: '2-5 Years',
    description: 'Design world-class, action-oriented workshops on negotiation, leadership presence, and corporate communication for college graduates.',
    responsibilities: [
      'Architect interactive lesson plans, case simulations, and rubric benchmarks',
      'Collaborate with industry leaders from Google, McKinsey, and Microsoft to distill workplace communication standards',
      'Track student evaluation metrics and iterate curriculum with data-driven feedback'
    ],
    requirements: [
      'Proven experience in corporate instructional design or corporate soft skills training',
      'Exceptional spoken and written communication',
      'Deep empathy for first-generation college students and tier-2/3 college graduates'
    ]
  },
  {
    id: 'car_2',
    title: 'Head of Campus Partnerships & University Alliances',
    department: 'Growth & Institutional Sales',
    location: 'Hyderabad, Telangana / Hybrid',
    type: 'Full-time',
    experience: '3-6 Years',
    description: 'Drive strategic partnerships with Deans, Training & Placement Officers (TPOs), and student council heads across 100+ top Indian universities.',
    responsibilities: [
      'Scale university MOUs for campus-wide soft-skill bootcamps',
      'Manage regional campus growth managers and student brand ambassadors',
      'Pitch custom institutional readiness packages to college placement trustees'
    ],
    requirements: [
      'Experience in B2B EdTech, higher-education sales, or institutional tie-ups',
      'Strong network with collegiate placement cells across India',
      'High-energy closer with consultative pitching skills'
    ]
  },
  {
    id: 'car_3',
    title: 'Student Success & Placement Coach',
    department: 'Student Operations',
    location: 'Remote (India)',
    type: 'Full-time',
    experience: '1-3 Years',
    description: 'Conduct 1-on-1 mock interviews, ATS resume reviews, and salary negotiation workshops for our highest-tier enrolled students.',
    responsibilities: [
      'Mentor graduating students through behavioral interview prep (STAR method)',
      'Host weekly live voice coaching clinics and pitch review circles',
      'Help students resolve anxiety and navigate multi-round corporate assessments'
    ],
    requirements: [
      'Background in HR, talent acquisition, recruitment, or career counseling',
      'Empathetic coaching demeanor with constructive feedback delivery',
      'Comfortable hosting live interactive webinars with 200+ participants'
    ]
  }
];

export const initialTestimonials: Testimonial[] = [
  {
    id: 'tst_1',
    name: 'Pooja Verma',
    college: 'NIT Kurukshetra, B.Tech 2026',
    rolePlaced: 'Associate Product Manager',
    company: 'PhonePe',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=80',
    quote: 'I had strong DSA knowledge, but kept stumbling in managerial and behavioral rounds. COMMUNITY.VA taught me how to articulate trade-offs and project real leadership. That made all the difference.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    courseTaken: 'Resume Building & High-Impact Interview Strategy'
  },
  {
    id: 'tst_2',
    name: 'Siddharth Nair',
    college: 'SRM University, Computer Science',
    rolePlaced: 'Business Analyst',
    company: 'Deloitte',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=80',
    quote: 'The Salary Negotiation masterclass gave me exact scripts to counter my initial offer. I secured an extra ₹1.8 LPA without feeling awkward or aggressive. Truly life-changing advice.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    courseTaken: 'The Art of Negotiating Your First Salary'
  },
  {
    id: 'tst_3',
    name: 'Aishwarya Sen',
    college: 'St. Xavier\'s College, B.Com',
    rolePlaced: 'Growth Marketing Specialist',
    company: 'CRED',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=80',
    quote: 'As a non-engineering student, breaking into tech seemed daunting. COMMUNITY.VA demystified the business side of startups and taught me how to present data compellingly.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    courseTaken: 'Demystifying Non-Technical Roles in Tech'
  }
];

export const initialCategories: EventCategory[] = [
  { id: 'cat_workshops', name: 'Workshops', description: 'Hands-on practical skill building masterclasses', color: 'blue', isCustom: false },
  { id: 'cat_jam_sessions', name: 'Jam Sessions', description: 'Musical and creative collaborative acoustic jams', color: 'amber', isCustom: false },
  { id: 'cat_open_mic', name: 'Open Mic', description: 'Poetry, stand-up comedy, and storytelling stages', color: 'purple', isCustom: false },
  { id: 'cat_talent_hunt', name: 'Talent Hunt', description: 'Inter-college competitive talent discoveries', color: 'rose', isCustom: false },
  { id: 'cat_box_cricket', name: 'Box Cricket', description: 'Fast-paced turf cricket tournaments', color: 'emerald', isCustom: false },
  { id: 'cat_sports', name: 'Sports Events', description: 'Athletics, badminton, football, and esports tourneys', color: 'green', isCustom: false },
  { id: 'cat_cultural', name: 'Cultural Events', description: 'Dance, theatre, music fests, and heritage celebrations', color: 'orange', isCustom: false },
  { id: 'cat_photography', name: 'Photography Contest', description: 'Visual storytelling and lens competitions', color: 'cyan', isCustom: false },
  { id: 'cat_short_film', name: 'Short Film Competition', description: 'Filmmaking, directing, and screenwriting festivals', color: 'indigo', isCustom: false },
  { id: 'cat_networking', name: 'Networking Meetups', description: 'Peer mixers, founder meetups, and alumni connects', color: 'teal', isCustom: false },
  { id: 'cat_career', name: 'Career Sessions', description: 'Resume clinics, industry transitions, and guidance', color: 'blue', isCustom: false },
  { id: 'cat_mock_interviews', name: 'Mock Interviews', description: '1-on-1 simulated interviews with senior executives', color: 'violet', isCustom: false },
  { id: 'cat_leadership', name: 'Leadership Programs', description: 'Team dynamics, public speaking, and presence cohorts', color: 'fuchsia', isCustom: false },
  { id: 'cat_entrepreneurship', name: 'Entrepreneurship Events', description: 'Pitch decks, startup bootcamps, and angel pitch sessions', color: 'amber', isCustom: false },
  { id: 'cat_college_collab', name: 'College Collaborations', description: 'Campus-wide flagship summits and MOU events', color: 'sky', isCustom: false },
  { id: 'cat_online', name: 'Online Events', description: 'Virtual webinars, remote workshops, and live AMAs', color: 'slate', isCustom: false },
  { id: 'cat_offline', name: 'Offline Events', description: 'In-person auditoriums, campus venues, and turf meets', color: 'emerald', isCustom: false }
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

  getEvents: (): Event[] => {
    const list = loadData('events', initialEvents);
    return list.map(e => ({
      ...e,
      qrCode: (!e.qrCode || e.qrCode.includes('api.qrserver.com') || e.qrCode.includes('communityva@razorpay'))
        ? '/upi-qr.jpg'
        : e.qrCode
    }));
  },
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

  getAmbassadors: (): CampusAmbassador[] => loadData('ambassadors', initialAmbassadors),
  saveAmbassadors: (data: CampusAmbassador[]) => saveData('ambassadors', data),

  getChallenges: (): WeeklyChallenge[] => loadData('challenges', initialChallenges),
  saveChallenges: (data: WeeklyChallenge[]) => saveData('challenges', data),

  getLeaderboard: (): LeaderboardEntry[] => loadData('leaderboard', initialLeaderboard),
  getCollegePartners: (): CollegePartner[] => loadData('collegePartners', initialCollegePartners),
  getCareerRoles: (): CareerRole[] => loadData('careerRoles', initialCareerRoles),
  getTestimonials: (): Testimonial[] => loadData('testimonials', initialTestimonials),
  getCategories: (): EventCategory[] => loadData('event_categories', initialCategories),
  saveCategories: (data: EventCategory[]) => saveData('event_categories', data),

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
