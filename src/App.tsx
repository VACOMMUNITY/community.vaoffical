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

      {/* Floating WhatsApp Quick Connect */}
      {!isAuthView && (
        <a
          href="https://wa.me/917416201359?text=Hello%20COMMUNITY.VA%2C%20I%20have%20an%20inquiry%20regarding%20events%20and%20courses."
          target="_blank"
          rel="noopener noreferrer"
          title="Chat with COMMUNITY.VA on WhatsApp (+91 7416201359)"
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-2.5 shadow-2xl shadow-green-950/50 hover:scale-105 active:scale-95 transition-all duration-200 group border border-emerald-400/30 cursor-pointer"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.97.53 1.87.813 2.796.813h.005c3.179 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.773-5.766zm3.411 8.232c-.144.405-.837.774-1.17.822-.311.045-.71.071-2.288-.582-1.89-1.025-3.11-2.955-3.204-3.08-.094-.125-.769-1.022-.769-1.949 0-.927.487-1.382.66-1.572.173-.19.377-.238.503-.238.126 0 .251.002.36.008.117.006.273-.044.427.326.16.386.545 1.332.593 1.43.048.098.08.213.016.34-.064.126-.096.205-.19.314-.094.11-.198.246-.282.33-.095.095-.193.198-.083.388.11.19.488.805 1.048 1.303.722.643 1.33.842 1.52.937.19.095.301.079.412-.047.111-.127.476-.554.603-.744.127-.19.254-.158.428-.095.174.063 1.108.522 1.298.617.19.095.317.142.364.222.048.079.048.459-.096.864z"/>
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.527 3.66 1.443 5.176L2 22l4.954-1.3c1.47.854 3.177 1.3 5.046 1.3 5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.153-.478-4.434-1.298l-.318-.204-2.946.772.787-2.871-.219-.348A8.136 8.136 0 0 1 3.833 12c0-4.503 3.664-8.167 8.167-8.167s8.167 3.664 8.167 8.167-3.664 8.167-8.167 8.167z"/>
          </svg>
          <span className="text-xs font-black tracking-wide hidden sm:inline">WhatsApp</span>
          <span className="text-[11px] font-semibold text-emerald-100 hidden md:inline">• +91 7416201359</span>
        </a>
      )}

    </div>
  );
}
