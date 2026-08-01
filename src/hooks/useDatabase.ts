import { useState, useEffect } from 'react';
import { api } from '../data/api';
import type { User, Course, Event, Enrollment, Registration, Payment, ForumThread, BlogArticle } from '../data/mockDatabase';

export const useDatabase = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [forum, setForum] = useState<ForumThread[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    try {
      const token = localStorage.getItem('cva_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Parallel requests for core catalogs
      const profilePromise = api.auth.getProfile();
      const coursesPromise = api.courses.getAll();
      const eventsPromise = api.events.getAll();
      const forumPromise = api.forum.getAll();
      const blogsPromise = api.blogs.getAll();

      const [profile, allCourses, allEvents, allForum, allBlogs] = await Promise.all([
        profilePromise.catch((e) => {
          console.error("Profile fetch error:", e);
          return null;
        }),
        coursesPromise.catch((e) => {
          console.error("Courses fetch error:", e);
          return [];
        }),
        eventsPromise.catch((e) => {
          console.error("Events fetch error:", e);
          return [];
        }),
        forumPromise.catch((e) => {
          console.error("Forum fetch error:", e);
          return [];
        }),
        blogsPromise.catch((e) => {
          console.error("Blogs fetch error:", e);
          return [];
        })
      ]);

      if (profile) {
        setCurrentUser(profile);
        
        // Fetch user-specific enrollments & registrations
        const enrsPromise = api.courses.getMyEnrollments();
        const regsPromise = api.events.getMyRegistrations();
        
        // Fetch admin data only if role matches
        const isAdmin = profile.role === 'admin';
        const usersPromise = isAdmin ? api.admin.getUsers() : Promise.resolve([]);
        const paymentsPromise = isAdmin ? api.admin.getPayments() : Promise.resolve([]);

        const [myEnrs, myRegs, allUsers, allPayments] = await Promise.all([
          enrsPromise.catch((e) => {
            console.error("Enrollments fetch error:", e);
            return [];
          }),
          regsPromise.catch((e) => {
            console.error("Registrations fetch error:", e);
            return [];
          }),
          usersPromise.catch((e) => {
            console.error("Users list fetch error:", e);
            return [];
          }),
          paymentsPromise.catch((e) => {
            console.error("Payments ledger fetch error:", e);
            return [];
          })
        ]);

        setEnrollments(myEnrs);
        setRegistrations(myRegs);
        setUsers(allUsers);
        setPayments(allPayments);
      }

      setCourses(allCourses);
      setEvents(allEvents);
      setForum(allForum);
      setBlogs(allBlogs);
    } catch (err) {
      console.error("useDatabase custom hook load failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadAllData();
    });

    const handleUpdate = () => {
      loadAllData();
    };

    window.addEventListener('db-update', handleUpdate);
    window.addEventListener('profile-update', handleUpdate);
    return () => {
      window.removeEventListener('db-update', handleUpdate);
      window.removeEventListener('profile-update', handleUpdate);
    };
  }, []);

  return {
    currentUser,
    users,
    courses,
    events,
    enrollments,
    registrations,
    payments,
    forum,
    blogs,
    loading,
    refresh: () => window.dispatchEvent(new Event('db-update'))
  };
};

export type UseDatabaseReturn = ReturnType<typeof useDatabase>;
