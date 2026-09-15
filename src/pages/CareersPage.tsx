import { useState, type FormEvent } from 'react';
import { 
  Briefcase, MapPin, ArrowRight, CheckCircle, 
  Sparkles, Heart, Zap
} from 'lucide-react';
import { db, type CareerRole } from '../data/mockDatabase';
import type { NavPage } from '../components/Navbar';

interface CareersPageProps {
  onNavigate?: (page: NavPage) => void;
}

export default function CareersPage({ onNavigate }: CareersPageProps) {
  const roles: CareerRole[] = db.getCareerRoles();
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(null);

  // Application State
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleApplySubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSelectedRole(null);
      setSubmitted(false);
      setApplicantName('');
      setApplicantEmail('');
      setApplicantPhone('');
      setPortfolioUrl('');
      setCoverNote('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-400 mb-4">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Join Our Mission • We Are Hiring</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Build the Future of EdTech with Us
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            We are looking for passionate builders, pedagogy architects, and student coaches who believe human communication and self-advocacy should be taught in every college in India.
          </p>
          {onNavigate && (
            <div className="pt-4 flex justify-center">
              <button 
                onClick={() => onNavigate('about')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Read our founding story & thesis</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Culture & Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Radical Autonomy</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Zero micromanagement. Own projects end-to-end with high accountability and transparent outcome-focused metrics.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mb-4">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Remote-First Culture</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Work from anywhere in India with flexible working hours and annual in-person company offsites.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400 mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Learning Stipend</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              ₹50,000 annual budget for books, executive coaching, professional conferences, and masterclasses.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 mb-4">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Health & Wellness</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Comprehensive health insurance covering you and your parents, plus mental health counseling access.
            </p>
          </div>
        </div>

        {/* Open Positions List */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Open Roles ({roles.length})</h2>
              <p className="text-xs text-slate-400 mt-1">Applications reviewed within 7 business days.</p>
            </div>
          </div>

          <div className="space-y-4">
            {roles.map(role => (
              <div 
                key={role.id}
                className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-400 uppercase">
                      {role.department}
                    </span>
                    <span className="text-xs text-slate-400">• {role.type}</span>
                    <span className="text-xs text-slate-400">• {role.experience}</span>
                  </div>
                  <h3 className="text-lg font-black text-white">{role.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 max-w-xl leading-relaxed">
                    {role.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{role.location}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => setSelectedRole(role)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer"
                  >
                    <span>View Role & Apply</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Role Details & Application Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-400 uppercase">
                  {selectedRole.department}
                </span>
                <h3 className="text-xl font-black text-white mt-2">{selectedRole.title}</h3>
                <span className="text-xs text-slate-400">{selectedRole.location} • {selectedRole.type}</span>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-white block uppercase">About the Role</span>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedRole.description}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-white block uppercase">Key Responsibilities</span>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                {selectedRole.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-white block uppercase">Requirements</span>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                {selectedRole.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Application Form */}
            <div className="pt-4 border-t border-white/10">
              <span className="text-sm font-black text-white block mb-3">Submit Your Application</span>
              
              {submitted ? (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center space-y-1">
                  <CheckCircle className="h-6 w-6 text-green-400 mx-auto" />
                  <span className="text-xs font-bold text-white block">Application Sent!</span>
                  <span className="text-[11px] text-green-300">Our hiring team will review your profile and reach out via email.</span>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="tel"
                      required
                      placeholder="Phone / WhatsApp"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="url"
                      required
                      placeholder="LinkedIn / Portfolio / Resume Link"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Briefly describe why this role excites you..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-bold text-slate-400 hover:bg-white/5 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
