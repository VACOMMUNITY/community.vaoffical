import { useState } from 'react';
import { 
  Sparkles, Menu, X, ArrowRight, User as UserIcon, LogOut, 
  Calendar, BookOpen, Users, Building2, 
  Briefcase, PhoneCall, Info
} from 'lucide-react';
import type { User } from '../data/mockDatabase';
import ThemeToggle from './ThemeToggle';

export type NavPage = 'landing' | 'events' | 'courses' | 'community' | 'for-colleges' | 'about' | 'careers' | 'contact' | 'login' | 'register' | 'client' | 'admin' | 'admin-login';

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Navbar({ currentPage, onNavigate, currentUser, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact navigation order requested
  const navLinks: { label: string; page: NavPage; icon: React.ReactNode }[] = [
    { label: 'Home', page: 'landing', icon: <Sparkles className="h-4 w-4" /> },
    { label: 'Events', page: 'events', icon: <Calendar className="h-4 w-4" /> },
    { label: 'Courses', page: 'courses', icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Community', page: 'community', icon: <Users className="h-4 w-4" /> },
    { label: 'For Colleges', page: 'for-colleges', icon: <Building2 className="h-4 w-4" /> },
    { label: 'About', page: 'about', icon: <Info className="h-4 w-4" /> },
    { label: 'Careers', page: 'careers', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Contact', page: 'contact', icon: <PhoneCall className="h-4 w-4" /> }
  ];

  const handleNavClick = (page: NavPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-white/10 border-slate-200/80 bg-slate-950/80 dark:bg-slate-950/80 bg-white/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <button 
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none shrink-0"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
            <span className="font-black text-white text-xs tracking-tighter">VA</span>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-40 blur transition duration-300"></div>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              COMMUNITY<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">.VA</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block -mt-1 tracking-wider uppercase">
              Learn Beyond The Classroom
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
          {navLinks.map((link) => {
            const isActive = currentPage === link.page;
            return (
              <button
                key={link.page}
                onClick={() => handleNavClick(link.page)}
                className={`relative px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'text-white bg-white/10 dark:bg-white/10 shadow-sm border border-white/15' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <ThemeToggle />

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick(currentUser.role === 'admin' ? 'admin' : 'client')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:scale-102 cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>{currentUser.role === 'admin' ? 'Admin Portal' : 'My Campus'}</span>
                {currentUser.role === 'admin' && (
                  <span className="ml-1 rounded bg-black/30 px-1.5 py-0.5 text-[9px] font-extrabold uppercase">
                    Admin
                  </span>
                )}
              </button>
              <button
                onClick={onLogout}
                title="Log Out"
                className="rounded-xl border border-slate-200 dark:border-white/10 p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/5 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('login')}
                className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition duration-200 hover:scale-102 cursor-pointer"
              >
                <span>Join Community</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-5 shadow-2xl transition-all animate-fade-in-down">
          <div className="space-y-1 mb-4">
            {navLinks.map((link) => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-blue-400'}>{link.icon}</span>
                  <span className="flex-1">{link.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white"></span>}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
            {currentUser ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleNavClick(currentUser.role === 'admin' ? 'admin' : 'client')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Go to {currentUser.role === 'admin' ? 'Admin Panel' : 'Student Dashboard'}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-xs font-bold text-red-400 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out ({currentUser.name.split(' ')[0]})</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 py-2.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Join Community
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
