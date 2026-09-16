import React, { useState, useEffect } from 'react';
import { api } from '../data/api';
import type { User } from '../data/mockDatabase';
import { ArrowLeft, Mail, Lock, User as UserIcon, Phone, ShieldAlert, Check, X, Sparkles, ArrowRight } from 'lucide-react';

interface AuthPagesProps {
  initialMode: 'login' | 'register' | 'forgot' | 'verify';
  onNavigate: (view: 'landing' | 'login' | 'register' | 'client' | 'admin') => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthPages({ initialMode, onNavigate, onLoginSuccess }: AuthPagesProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>(initialMode);
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Error/Status messages
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  
  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await api.auth.login(email, password);
      showNotification(`Welcome back, ${user.name}! Logging you in...`, 'success');
      setTimeout(() => {
        onLoginSuccess(user);
      }, 600);
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password.';
      setErrorMsg(msg);
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await api.auth.register(name, email, phone, password);
      showNotification(`Account created! Welcome to COMMUNITY.VA, ${user.name}.`, 'success');
      setTimeout(() => {
        onLoginSuccess(user);
      }, 600);
    } catch (err: any) {
      const msg = err.message || 'Registration failed.';
      setErrorMsg(msg);
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('A password recovery email has been sent to your registered address.');
    showNotification('Password reset link sent to your email.', 'success');
    setTimeout(() => {
      setStatusMsg('');
      setMode('login');
    }, 3000);
  };

  const handleSocialLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await api.auth.googleLogin('google.student@example.com', 'Google Student');
      showNotification(`Google account authenticated! Welcome, ${user.name}.`, 'success');
      setTimeout(() => {
        onLoginSuccess(user);
      }, 600);
    } catch (err: any) {
      const msg = err.message || 'Google sign-in failed.';
      setErrorMsg(msg);
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo logins helpers
  const triggerDemoLogin = async (role: 'admin' | 'student') => {
    const emailToUse = role === 'admin' ? 'sarah@example.com' : 'alex@example.com';
    const pwdToUse = role === 'admin' ? 'admin' : 'password';
    setEmail(emailToUse);
    setPassword(pwdToUse);
    setErrorMsg('');
    
    setTimeout(async () => {
      try {
        const user = await api.auth.login(emailToUse, pwdToUse);
        showNotification(`Logged in as ${user.name} (${role === 'admin' ? 'Administrator' : 'Student'}).`, 'success');
        setTimeout(() => {
          onLoginSuccess(user);
        }, 500);
      } catch (err: any) {
        const msg = err.message || 'Demo access failed.';
        setErrorMsg(msg);
        showNotification(msg, 'error');
      }
    }, 200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-4 sm:px-6 py-12 relative overflow-hidden text-slate-100 selection:bg-blue-600 selection:text-white">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl bg-slate-900/70 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-2xl relative z-10 transition">
        {/* Back Link */}
        <button 
          onClick={() => onNavigate('landing')} 
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Homepage
        </button>

        {/* Brand Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 mb-3">
            <span className="text-xl font-black text-white">VA</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1">
            COMMUNITY<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">.VA</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Sign in to access your courses, events, and certificates.'}
            {mode === 'register' && 'Create your student account with any custom credentials.'}
            {mode === 'forgot' && 'Reset your password to regain account access.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 animate-fade-in">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-xs text-green-300 animate-fade-in">
            <Check className="h-4 w-4 shrink-0 text-green-400 mt-0.5" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button 
                  type="button" 
                  onClick={() => setMode('forgot')}
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 py-3 text-center text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 transition duration-200 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 py-3 text-center text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 transition duration-200 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <Sparkles className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Enter your registered email address. We'll send instructions to reset your password.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-center text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition duration-200 cursor-pointer"
            >
              Send Reset Link
            </button>
            <button 
              type="button" 
              onClick={() => setMode('login')}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-white transition mt-2 cursor-pointer"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* Social Google Login & Mode Toggle */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <span className="relative bg-slate-900 px-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">Or continue with</span>
        </div>

        <button
          type="button"
          onClick={handleSocialLogin}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-center text-xs font-bold text-white transition hover:scale-101 cursor-pointer"
        >
          <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.96 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.85 3C6.26 7.42 8.9 5.04 12 5.04z" />
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.59l3.7 2.87c2.16-2 3.41-4.94 3.41-8.61z" />
            <path fill="#FBBC05" d="M5.35 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.82 0 10.97 0 13.2s.54 4.38 1.5 6.3l3.85-3z" />
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.03.69-2.35 1.1-3.96 1.1-3.1 0-5.74-2.38-6.65-5.46L1.8 15.85C3.69 19.7 7.65 22.3 12 22.3z" />
          </svg>
          Sign in with Google
        </button>

        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer">
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer">
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Quick 1-Click Demo Logins */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">⚡ 1-Click Demo Accounts</span>
            <span className="text-[10px] text-slate-500">Or use your own credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => triggerDemoLogin('student')}
              className="rounded-xl border border-white/10 bg-slate-800/80 hover:bg-slate-700/80 py-2 px-3 text-center text-xs font-bold text-white transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Student</span>
              <span className="text-[10px] text-slate-400 font-normal">(Alex)</span>
            </button>
            <button
              type="button"
              onClick={() => triggerDemoLogin('admin')}
              className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 py-2 px-3 text-center text-xs font-bold text-indigo-300 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Admin</span>
              <span className="text-[10px] text-indigo-400 font-normal">(Sarah)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3.5 rounded-2xl bg-slate-900/95 border border-white/15 backdrop-blur-xl px-4 py-3.5 text-white shadow-2xl animate-fade-in max-w-sm">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/10">
            {toast.type === 'success' && <Check className="h-4 w-4 text-green-400" />}
            {toast.type === 'error' && <ShieldAlert className="h-4 w-4 text-red-400" />}
            {toast.type === 'info' && <Mail className="h-4 w-4 text-blue-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-xs leading-snug">{toast.message}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setToast(null)} 
            className="text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
