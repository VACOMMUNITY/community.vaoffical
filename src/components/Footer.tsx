import { useState, type FormEvent } from 'react';
import { Sparkles, ShieldCheck, Mail, CheckCircle, Heart } from 'lucide-react';
import type { NavPage } from './Navbar';

interface FooterProps {
  onNavigate: (page: NavPage) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="w-full border-t border-white/10 dark:border-white/10 border-slate-200/80 bg-slate-950 text-slate-300 transition-colors">
      
      {/* Top Banner: College & Student Community CTA */}
      <div className="border-b border-white/10 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-purple-950/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Campus Chapter Initiative 2026</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Ready to bring COMMUNITY.VA workshops to your campus?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Partner with our corporate mentors to upskill 500+ students in a single weekend. Verified certifications, resume audits, and mock placement interviews.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => { onNavigate('for-colleges'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer"
            >
              For Universities
            </button>
            <button
              onClick={() => { onNavigate('community'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              Apply as Campus Ambassador
            </button>
          </div>
        </div>
      </div>

      {/* Main 4-Column Directory Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-md">
                <span className="font-black text-white text-xs">VA</span>
              </div>
              <span className="font-black text-lg tracking-tight text-white">
                COMMUNITY<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">.VA</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              COMMUNITY.VA is a mission-driven EdTech startup empowering college students and fresh graduates with elite human skills: persuasion, active listening, executive presence, salary negotiation, and interview resilience.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              <span>Registered Startup • Backed by EdTech Mentors</span>
            </div>

            {/* Newsletter */}
            <div className="pt-2">
              <span className="text-xs font-bold text-white block mb-2">The Sunday Career Playbook</span>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@college.edu"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
                >
                  Join
                </button>
              </form>
              {subscribed && (
                <span className="text-[11px] text-green-400 font-semibold flex items-center gap-1 mt-1.5 animate-fade-in">
                  <CheckCircle className="h-3 w-3" /> Subscribed! Welcome to the insider circle.
                </span>
              )}
            </div>
          </div>

          {/* Col 2: Programs */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white">Programs</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => { onNavigate('events'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Live Masterclasses
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('courses'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Self-Paced Courses
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('events'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Salary Negotiation Lab
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('courses'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  ATS Resume Blueprint
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('courses'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Public Speaking Bootcamp
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('events'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Mock Interview Clinics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Campus */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white">Community</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => { onNavigate('community'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Campus Ambassador Hub
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('community'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Student Leaderboard
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('community'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Weekly 60s Challenges
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('community'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Student Discussion Forum
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('for-colleges'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  For Colleges & TPOs
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('community'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Refer a Friend (Earn ₹500)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Startup & Careers */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white">Startup</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => { onNavigate('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  About COMMUNITY.VA
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('careers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer flex items-center gap-1.5">
                  <span>Careers</span>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-400">Hiring</span>
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Pedagogy & Mission
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Partner with Us
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">
                  Contact & Support
                </button>
              </li>
              <li className="pt-1 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-emerald-400 font-bold">📍</span>
                  <span>Hyderabad, Telangana, India</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-green-400 font-bold">💬</span>
                  <a href="https://wa.me/917416201359" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                    WhatsApp: +91 7416201359
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-400 font-bold">✉️</span>
                  <a href="mailto:community.va01@gmail.com" className="text-slate-300 hover:text-white hover:underline">
                    community.va01@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-400 font-bold">✉️</span>
                  <a href="mailto:foundercommunityva@gmail.com" className="text-slate-300 hover:text-white hover:underline">
                    foundercommunityva@gmail.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-1 text-slate-500">
            <span>© {new Date().getFullYear()} COMMUNITY.VA Technologies Pvt. Ltd. Crafted with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-current inline" />
            <span>for the next generation of leaders.</span>
            <span className="mx-1 text-slate-600">•</span>
            <button 
              onClick={() => { onNavigate('admin-login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-slate-500 hover:text-indigo-400 transition cursor-pointer"
            >
              Admin Portal
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="LinkedIn">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
            </a>
            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Instagram">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            {/* Twitter / X */}
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Twitter">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            {/* YouTube */}
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="YouTube">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
