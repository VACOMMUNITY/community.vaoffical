import { useState, useEffect, lazy, Suspense } from 'react';
import { api } from './data/api';
import type { User } from './data/mockDatabase';
import Navbar, { type NavPage } from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';

// Lazy load secondary route pages for lightning fast initial load (<200ms)
const EventsPage = lazy(() => import('./pages/EventsPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const ForCollegesPage = lazy(() => import('./pages/ForCollegesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AuthPages = lazy(() => import('./pages/AuthPages'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AIChatAssistant = lazy(() => import('./components/AIChatAssistant'));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
      <span className="text-xs font-semibold text-slate-400">Loading experience...</span>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<NavPage>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('cva_token');
    if (token) {
      api.auth.getProfile()
        .then(user => {
          setCurrentUser(user);
        })
        .catch(() => {
          api.auth.logout();
          setCurrentUser(null);
        });
    }

    // Sync state whenever profile is updated
    const handleProfileSync = () => {
      const token = localStorage.getItem('cva_token');
      if (token) {
        api.auth.getProfile()
          .then(user => {
            setCurrentUser(user);
          })
          .catch(() => {});
      }
    };
    window.addEventListener('profile-update', handleProfileSync);
    return () => window.removeEventListener('profile-update', handleProfileSync);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setView('admin');
    } else {
      setView('client');
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setView('landing');
  };

  const navigateTo = (newView: NavPage) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDashboardView = view === 'client' || view === 'admin';
  const isAuthView = view === 'login' || view === 'register';

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 transition-colors duration-300 selection:bg-blue-600 selection:text-white">
      
      {/* Top Glassmorphism Navigation Bar */}
      {!isDashboardView && !isAuthView && (
        <Navbar 
          currentPage={view} 
          onNavigate={navigateTo} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />
      )}

      {/* Main Dynamic View Router with Suspense for ultra-fast code-split rendering */}
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          {view === 'landing' && (
            <LandingPage 
              onNavigate={navigateTo} 
              currentUser={currentUser} 
              onLogout={handleLogout} 
            />
          )}

          {view === 'events' && (
            <EventsPage 
              onNavigate={navigateTo} 
              currentUser={currentUser} 
            />
          )}

          {view === 'courses' && (
            <CoursesPage 
              onNavigate={navigateTo} 
              currentUser={currentUser} 
            />
          )}

          {view === 'community' && (
            <CommunityPage 
              onNavigate={navigateTo} 
              currentUser={currentUser} 
            />
          )}

          {view === 'for-colleges' && (
            <ForCollegesPage 
              onNavigate={navigateTo} 
            />
          )}

          {view === 'about' && (
            <AboutPage 
              onNavigate={navigateTo} 
            />
          )}

          {view === 'careers' && (
            <CareersPage 
              onNavigate={navigateTo} 
            />
          )}

          {view === 'contact' && (
            <ContactPage 
              onNavigate={navigateTo} 
            />
          )}

          {view === 'login' && (
            <AuthPages 
              initialMode="login" 
              onNavigate={navigateTo} 
              onLoginSuccess={handleLoginSuccess} 
            />
          )}

          {view === 'register' && (
            <AuthPages 
              initialMode="register" 
              onNavigate={navigateTo} 
              onLoginSuccess={handleLoginSuccess} 
            />
          )}

          {view === 'client' && (
            <ClientDashboard 
              onNavigate={navigateTo} 
              onLogout={handleLogout} 
            />
          )}

          {view === 'admin' && (
            <AdminDashboard 
              onNavigate={navigateTo} 
              onLogout={handleLogout} 
            />
          )}
        </Suspense>
      </main>

      {/* Footer */}
      {!isDashboardView && !isAuthView && (
        <Footer onNavigate={navigateTo} />
      )}

      {/* Floating AI Assistant (Lazy loaded, non-blocking) */}
      {!isAuthView && (
        <Suspense fallback={null}>
          <AIChatAssistant />
        </Suspense>
      )}

    </div>
  );
}
