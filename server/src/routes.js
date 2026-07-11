import express from 'express';
import { verifyToken, requireAdmin } from './middleware/authMiddleware.js';
import { 
  register, login, getProfile, updateProfile, googleLogin 
} from './controllers/authController.js';
import { 
  getCourses, getCourseById, enrollInCourse, getMyEnrollments, updateLessonProgress, toggleWishlist, addCourse, deleteCourse, addVideoLesson, updateCourse 
} from './controllers/coursesController.js';
import { 
  getEvents, getEventById, registerForEvent, getMyRegistrations, cancelRegistration, addEvent, deleteEvent, getEventAttendees, updateEvent 
} from './controllers/eventsController.js';
import { 
  getAllUsers, toggleBlockUser, changeUserRole, deleteUser, getAllPayments, refundPayment 
} from './controllers/adminController.js';
import { 
  getThreads, createThread, createReply, toggleLikeThread 
} from './controllers/forumController.js';
import { 
  getBlogs, getBlogById 
} from './controllers/blogsController.js';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', verifyToken, getProfile);
router.put('/auth/profile/update', verifyToken, updateProfile);
router.post('/auth/google', googleLogin);

// --- Course Routes ---
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.post('/courses/enroll', verifyToken, enrollInCourse);
router.get('/courses/enrollments/my', verifyToken, getMyEnrollments);
router.put('/courses/progress', verifyToken, updateLessonProgress);
router.post('/courses/wishlist', verifyToken, toggleWishlist);
// Course Admin CRUD
router.post('/courses/add', verifyToken, requireAdmin, addCourse);
router.put('/courses/:id', verifyToken, requireAdmin, updateCourse);
router.delete('/courses/:id', verifyToken, requireAdmin, deleteCourse);
router.post('/courses/:id/video', verifyToken, requireAdmin, addVideoLesson);

// --- Event Routes ---
router.get('/events', getEvents);
router.get('/events/:id', getEventById);
router.post('/events/register', verifyToken, registerForEvent);
router.get('/events/registrations/my', verifyToken, getMyRegistrations);
router.delete('/events/registrations/cancel/:id', verifyToken, cancelRegistration);
// Event Admin CRUD
router.post('/events/add', verifyToken, requireAdmin, addEvent);
router.put('/events/:id', verifyToken, requireAdmin, updateEvent);
router.delete('/events/:id', verifyToken, requireAdmin, deleteEvent);
router.get('/events/:id/attendees', verifyToken, requireAdmin, getEventAttendees);

// --- Admin Control Routes ---
router.get('/admin/users', verifyToken, requireAdmin, getAllUsers);
router.put('/admin/users/:id/block', verifyToken, requireAdmin, toggleBlockUser);
router.put('/admin/users/:id/role', verifyToken, requireAdmin, changeUserRole);
router.delete('/admin/users/:id', verifyToken, requireAdmin, deleteUser);
router.get('/admin/payments', verifyToken, requireAdmin, getAllPayments);
router.post('/admin/payments/refund/:id', verifyToken, requireAdmin, refundPayment);

// --- Forum Routes ---
router.get('/forum', getThreads);
router.post('/forum/threads', verifyToken, createThread);
router.post('/forum/threads/:threadId/reply', verifyToken, createReply);
router.post('/forum/threads/:id/like', verifyToken, toggleLikeThread);

// --- Blog Routes ---
router.get('/blogs', getBlogs);
router.get('/blogs/:id', getBlogById);

export default router;
