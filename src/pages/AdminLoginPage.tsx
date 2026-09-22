import React, { useState } from 'react';
import { api } from '../data/api';
import type { User } from '../data/mockDatabase';
import { ArrowLeft, Mail, Lock, ShieldCheck, ShieldAlert, ArrowRight, Check } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (view: any) => void;
  onLoginSuccess: (user: User) => void;
}

export default function AdminLoginPage({ onNavigate, onLoginSuccess }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const adminUser = await api.auth.adminLogin(email, password);
      setSuccessMsg('Administrator credentials verified. Launching Admin Dashboard...');
      setTimeout(() => {
        onLoginSuccess(adminUser);
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Access Denied: Unauthorized admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070A12] px-4 sm:px-6 py-12 relative overflow-hidden text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* High-security background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-indigo-900/30 via-purple-900/20 to-blue-900/20 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-indigo-500/20 p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={() => onNavigate('landing')} 
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Homepage
        </button>

        {/* Shield Icon & Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 mb-3 text-indigo-400">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 mb-2">
            Restricted Access
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Admin Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with your authorized administrator email and password.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 animate-fade-in">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300 animate-fade-in">
            <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="admin@communityva.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Password</label>
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
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500 py-3 text-center text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 transition duration-200 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Verifying Authorization...' : 'Access Admin Dashboard'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-500">
          <span>Student or Member? </span>
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
          >
            Student Sign In
          </button>
        </div>

      </div>
    </div>
  );
}
