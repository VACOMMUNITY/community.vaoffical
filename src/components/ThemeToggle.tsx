import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDark]);

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('ThemeToggle clicked. Current state isDark:', isDark);
    
    try {
      if (isDark) {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        localStorage.setItem('theme', 'light');
        setIsDark(false);
        console.log('ThemeToggle: Switched to light mode');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        localStorage.setItem('theme', 'dark');
        setIsDark(true);
        console.log('ThemeToggle: Switched to dark mode');
      }
    } catch (e) {
      console.error('ThemeToggle click error:', e);
      // Fallback without localStorage
      if (isDark) {
        document.documentElement.classList.remove('dark');
        setIsDark(false);
      } else {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-brand-200/50 dark:border-brand-800/30 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500 hover:scale-105 cursor-pointer relative z-50"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 animate-pulse-slow" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

