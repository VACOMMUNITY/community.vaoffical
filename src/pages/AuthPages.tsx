import React, { useState, useEffect } from 'react';
import { api } from '../data/api';
import type { User } from '../data/mockDatabase';
import { ArrowLeft, Mail, Lock, User as UserIcon, Phone, ShieldAlert, Check, X } from 'lucide-react';

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
  const [verificationCode, setVerificationCode] = useState('');

  // Error/Status messages
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const [registeredUser, setRegisteredUser] = useState<User | null>(null);
  const [verifyReason, setVerifyReason] = useState<'register' | 'login' | 'google'>('register');
  
  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Request browser Notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Browser Notification permission status:', permission);
      });
    }
  }, []);

  // Show Toast & Desktop notification helper
  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });

    // Show native browser desktop notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const title = type === 'success' ? '⚡ COMMUNITY.VA - Verification' : type === 'error' ? '❌ COMMUNITY.VA - Error' : 'ℹ️ COMMUNITY.VA - Info';
        new Notification(title, {
          body: message,
          icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>'
        });
      } catch (err) {
        console.error('Failed to trigger desktop notification:', err);
      }
    }
  };

  // Auto-clear Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const user = await api.auth.login(email, password);
      // Transition to OTP verification stage
      setRegisteredUser(user);
      setVerifyReason('login');
      setMode('verify');
      showNotification(`Credentials verified! A 2-step verification code "1234" has been sent to your device.`, 'success');
    } catch (err: any) {
      const msg = err.message || 'Invalid email/phone or password.';
      setErrorMsg(msg);
      showNotification(msg, 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const user = await api.auth.register(name, email, phone, password);
      setRegisteredUser(user);
      setVerifyReason('register');
      setMode('verify');
      showNotification('Account registered! Verification code "1234" has been sent to your email.', 'success');
    } catch (err: any) {
      const msg = err.message || 'Registration failed.';
      setErrorMsg(msg);
      showNotification(msg, 'error');
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate verification check
    if (verificationCode === '1234' || verificationCode.length === 4) {
      if (registeredUser) {
        showNotification('Verification successful! Logging you in...', 'success');
        setTimeout(() => {
          onLoginSuccess(registeredUser);
        }, 850);
      } else {
        const msg = 'Verification session not found. Please try again.';
        setErrorMsg(msg);
        showNotification(msg, 'error');
      }
    } else {
      const msg = 'Incorrect OTP. Try entering "1234" to pass.';
      setErrorMsg(msg);
      showNotification(msg, 'error');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = 'A password recovery email has been sent with recovery instructions.';
    setStatusMsg(msg);
    showNotification('Instructions sent! A mock reset link has been dispatched to your email.', 'success');
    setTimeout(() => {
      setStatusMsg('');
      setMode('login');
    }, 3000);
  };

  const handleSocialLogin = async () => {
    setErrorMsg('');
    try {
      const user = await api.auth.googleLogin('google.student@example.com', 'Google Student');
      // Transition to OTP verification stage
      setRegisteredUser(user);
      setVerifyReason('google');
      setMode('verify');
      showNotification('Google account authenticated! A 2-step verification code "1234" has been sent.', 'success');
    } catch (err: any) {
      const msg = err.message || 'Google login failed.';
      setErrorMsg(msg);
      showNotification(msg, 'error');
    }
  };

  // Quick Demo logins helpers
  const triggerDemoLogin = async (role: 'admin' | 'student') => {
    const emailToUse = role === 'admin' ? 'sarah@example.com' : 'alex@example.com';
    const pwdToUse = role === 'admin' ? 'admin' : 'password';
    setEmail(emailToUse);
    setPassword(pwdToUse);
    
    // Delay slightly to show credentials in inputs
    setTimeout(async () => {
      try {
        const user = await api.auth.login(emailToUse, pwdToUse);
        setRegisteredUser(user);
        setVerifyReason('login');
        setMode('verify');
        showNotification(`Demo credentials verified! Verification code "1234" sent.`, 'success');
      } catch (err: any) {
        const msg = err.message || 'Demo access failed.';
        setErrorMsg(msg);
        showNotification(msg, 'error');
      }
    }, 300);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-black via-zinc-950 to-brand-950 px-6 py-12 relative overflow-hidden">
      <div className="w-full max-w-md rounded-3xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 shadow-2xl transition">
        {/* Back Link */}
        <button 
          onClick={() => onNavigate('landing')} 
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-350 hover:text-white mb-6 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Homepage
        </button>

        {/* Brand Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-red-500 shadow-lg mb-3">
            <span className="text-xl font-extrabold text-white">VA</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            COMMUNITY<span className="text-brand-400">.VA</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Develop soft skills. Elevate your potential.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-xs text-green-300">
            <Check className="h-4.5 w-4.5 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email or Phone Number</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-450" />
                <input
                  type="text"
                  required
                  placeholder="e.g. name@example.com or +1 555-0144"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button 
                  type="button" 
                  onClick={() => setMode('forgot')}
                  className="text-[10px] font-bold text-brand-400 hover:text-brand-300 transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-450" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 hover:bg-brand-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition duration-200 cursor-pointer"
            >
              Sign In
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-450" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-450" />
                <input
                  type="email"
                  required
                  placeholder="e.g. name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-450" />
                <input
                  type="tel"
                  required
                  placeholder="+1 555-0100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Choose Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-450" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 hover:bg-brand-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition duration-200 cursor-pointer"
            >
              Register Account
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Enter your email address and we will send you a mock verification link to reset your password.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-450" />
                <input
                  type="email"
                  required
                  placeholder="e.g. name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 hover:bg-brand-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition duration-200 cursor-pointer"
            >
              Send Reset Code
            </button>
            <button 
              type="button" 
              onClick={() => setMode('login')}
              className="w-full text-center text-xs font-bold text-slate-300 hover:text-white transition mt-2 cursor-pointer"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* EMAIL VERIFICATION OTP */}
        {mode === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-xs text-slate-350 mb-4 leading-relaxed">
              {verifyReason === 'register' && (
                <>We have simulated sending a 4-digit verification code to <span className="font-bold text-brand-400">{email}</span> to activate your account.</>
              )}
              {verifyReason === 'login' && (
                <>Identity verification required. A 2-step security code has been sent to your email or registered phone.</>
              )}
              {verifyReason === 'google' && (
                <>Google Sign-In confirmed. Please enter the 2-step verification code sent to your registered account.</>
              )}
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Enter Code</label>
              <input
                type="text"
                required
                placeholder="Enter 1234 to verify"
                maxLength={4}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-widest text-lg font-bold rounded-xl border border-white/10 bg-white/5 py-3 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 hover:bg-brand-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition duration-200 cursor-pointer"
            >
              Verify & Log In
            </button>
            <button 
              type="button" 
              onClick={() => {
                if (verifyReason === 'register') {
                  setMode('register');
                } else {
                  setMode('login');
                }
              }}
              className="w-full text-center text-xs font-bold text-slate-300 hover:text-white transition mt-2 cursor-pointer"
            >
              Change Details
            </button>
          </form>
        )}

        {/* Social Google Login & Mode Toggle Divider */}
        {mode !== 'verify' && (
          <>
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <span className="relative bg-gradient-to-tr from-black to-brand-950 px-3 text-xs text-slate-450 font-bold uppercase tracking-wider">Or continue with</span>
            </div>

            <button
              type="button"
              onClick={handleSocialLogin}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3 text-center text-sm font-bold text-white transition hover:scale-101 cursor-pointer"
            >
              {/* Google SVG Icon */}
              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.96 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.85 3C6.26 7.42 8.9 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.59l3.7 2.87c2.16-2 3.41-4.94 3.41-8.61z" />
                <path fill="#FBBC05" d="M5.35 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.82 0 10.97 0 13.2s.54 4.38 1.5 6.3l3.85-3z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.03.69-2.35 1.1-3.96 1.1-3.1 0-5.74-2.38-6.65-5.46L1.8 15.85C3.69 19.7 7.65 22.3 12 22.3z" />
              </svg>
              Sign in with Google
            </button>

            <div className="mt-6 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setMode('register')} className="font-bold text-brand-400 hover:text-brand-300 transition cursor-pointer">
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="font-bold text-brand-400 hover:text-brand-300 transition cursor-pointer">
                    Sign In
                  </button>
                </>
              )}
            </div>

            {/* Quick Demo Login Triggers */}
            <div className="mt-8 rounded-2xl bg-white/5 border border-white/5 p-4">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block text-center mb-3">⚡ Quick Demo Access</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => triggerDemoLogin('student')}
                  className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-755 border border-white/5 py-2 text-center text-xs font-extrabold text-white transition cursor-pointer"
                >
                  Log In Student
                </button>
                <button
                  type="button"
                  onClick={() => triggerDemoLogin('admin')}
                  className="flex-1 rounded-xl bg-brand-700 hover:bg-brand-655 border border-white/5 py-2 text-center text-xs font-extrabold text-white transition cursor-pointer"
                >
                  Log In Admin
                </button>
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-2.5">Provides instant access with preloaded data.</p>
            </div>
          </>
        )}
      </div>

      {/* Dynamic Floating Toast Notification for Verification Events */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3.5 rounded-2xl bg-slate-900/95 border border-slate-800 backdrop-blur-md px-5 py-4 text-white shadow-2xl animate-fade-in-up max-w-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-850">
            {toast.type === 'success' && <Check className="h-4.5 w-4.5 text-green-400" />}
            {toast.type === 'error' && <ShieldAlert className="h-4.5 w-4.5 text-red-500" />}
            {toast.type === 'info' && <Mail className="h-4.5 w-4.5 text-brand-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black capitalize tracking-wide text-slate-100">
              {toast.type === 'success' ? 'Verification Success' : toast.type === 'error' ? 'Verification Error' : 'System Notice'}
            </h4>
            <p className="text-slate-350 text-[11px] leading-relaxed mt-0.5">{toast.message}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setToast(null)} 
            className="rounded-lg p-1 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
