import { useState, useEffect } from 'react';
import { api } from './data/api';
import type { User } from './data/mockDatabase';
import Navbar, { type NavPage } from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import EventsPage from './pages/EventsPage';
import CoursesPage from './pages/CoursesPage';
import CommunityPage from './pages/CommunityPage';
import ForCollegesPage from './pages/ForCollegesPage';
import AboutPage from './pages/AboutPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import AuthPages from './pages/AuthPages';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AIChatAssistant from './components/AIChatAssistant';

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
        .catch((err) => {
          console.error("Profile recovery failed:", err);
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

      {/* Main Dynamic View Router */}
      <main className="flex-1">
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

        {isAuthView && (
          <AuthPages 
            initialMode={view as 'login' | 'register'} 
            onNavigate={(target) => navigateTo(target as NavPage)} 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}

        {view === 'client' && (
          <ClientDashboard 
            onLogout={handleLogout} 
            onNavigate={(target) => navigateTo(target as NavPage)} 
          />
        )}

        {view === 'admin' && (
          <AdminDashboard 
            onLogout={handleLogout} 
            onNavigate={(target) => navigateTo(target as NavPage)} 
          />
        )}
      </main>

      {/* Startup Multi-Column Footer */}
      {!isDashboardView && !isAuthView && (
        <Footer onNavigate={navigateTo} />
      )}

      {/* Global AI Coach Floating Assistant */}
      <AIChatAssistant />

    </div>
  );
}
