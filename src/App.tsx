import { useState, useEffect } from 'react';
import { api } from './data/api';
import type { User } from './data/mockDatabase';
import LandingPage from './pages/LandingPage';
import AuthPages from './pages/AuthPages';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AIChatAssistant from './components/AIChatAssistant';

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'client' | 'admin'>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('cva_token');
    if (token) {
      api.auth.getProfile()
        .then(user => {
          setCurrentUser(user);
          // Auto-route based on role if on landing or auth views
          if (user.role === 'admin') {
            setView('admin');
          } else {
            setView('client');
          }
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

  const navigateTo = (newView: 'landing' | 'login' | 'register' | 'client' | 'admin') => {
    setView(newView);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Route Switcher */}
      {view === 'landing' && (
        <LandingPage 
          onNavigate={navigateTo} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />
      )}

      {(view === 'login' || view === 'register') && (
        <AuthPages 
          initialMode={view} 
          onNavigate={navigateTo} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}

      {view === 'client' && (
        <ClientDashboard 
          onLogout={handleLogout} 
          onNavigate={navigateTo} 
        />
      )}

      {view === 'admin' && (
        <AdminDashboard 
          onLogout={handleLogout} 
          onNavigate={navigateTo} 
        />
      )}

      {/* Global Coach Floating Assistant */}
      <AIChatAssistant />

    </div>
  );
}
