import { Sparkles } from 'lucide-react';
import type { NavPage } from '../components/Navbar';

interface AboutPageProps {
  onNavigate: (page: NavPage) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const leadership = [
    {
      name: 'Sarah Connor',
      role: 'Co-Founder & Chief Learning Officer',
      bio: 'Former HR Leader & Executive Coach. Trained 10,000+ engineers on high-stakes communication.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Abhiram Paidimarri',
      role: 'Founder & CEO',
      bio: 'Product builder and community architect passionate about democratizing corporate readiness for students across India.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Rhea Chakraborty',
      role: 'Head of Pedagogy & Curriculum',
      bio: 'Instructional designer specialized in behavioral psychology, gamified education, and STAR interview rubrics.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Our Mission & Founding Philosophy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Bridging the College-to-Corporate Human Skill Chasm
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Every year, millions of bright college students graduate with technical credentials, but stumble on the skills that actually determine hiring, promotions, and compensation: communication, persuasion, and self-advocacy.
          </p>
        </div>

        {/* The Thesis / Problem Statement */}
        <div className="p-8 sm:p-12 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950/30 via-indigo-950/30 to-purple-950/30 backdrop-blur-xl mb-16 shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 block">The Problem</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Degrees prove you can memorize. Non-technical skills prove you can lead.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Standard university curricula were built decades ago for an academic era. Today's corporate workplace demands cross-functional consensus building, executive storytelling, emotional agility, and fearless salary negotiation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-xl font-black text-red-400 block">75% of Rejections</span>
                <span className="text-slate-400 mt-1 block">In final-round technical interviews happen due to poor behavioral articulation and low confidence.</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-xl font-black text-green-400 block">₹2.4 LPA Difference</span>
                <span className="text-slate-400 mt-1 block">Candidates who negotiate professionally secure an average ₹2.4 Lakhs higher starting compensation package.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Our 3-Pillar Pedagogy */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">The Action-First Learning Model</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              No passive lectures. Every COMMUNITY.VA program is structured around deliberate practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 font-black">
                1
              </div>
              <h3 className="text-base font-extrabold text-white">High-Stakes Simulation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Students practice real scenarios: roleplaying an underperforming peer confrontation, speaking to a panel of 5 skeptics, or counter-offering an HR salary package.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 font-black">
                2
              </div>
              <h3 className="text-base font-extrabold text-white">Instant Rubric Critique</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No vague feedback. Mentors score performance against the STAR behavioral matrix, voice cadence standards, and body language micro-cues.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400 font-black">
                3
              </div>
              <h3 className="text-base font-extrabold text-white">Cryptographic Certification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Graduates receive verified digital badges that recruiters can verify with a single QR scan, backing up their resumes with genuine proof of readiness.
              </p>
            </div>
          </div>
        </div>

        {/* Founding & Leadership Team */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">The Minds Behind COMMUNITY.VA</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Practitioners, not academics. Experienced executives who have screened and hired thousands of candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leadership.map((leader, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-center space-y-3">
                <img 
                  src={leader.image} 
                  alt={leader.name} 
                  className="h-24 w-24 rounded-full mx-auto object-cover border-2 border-indigo-500 shadow-lg"
                />
                <div>
                  <h4 className="font-extrabold text-base text-white">{leader.name}</h4>
                  <span className="text-xs font-semibold text-indigo-400 block">{leader.role}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vision & Call to Action */}
        <div className="p-8 sm:p-12 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-900/80 text-center max-w-3xl mx-auto shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-black text-white">Scaling to 100,000+ Future Leaders</h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
            COMMUNITY.VA is expanding partnerships with tier-1 and tier-2 universities across India. Be part of the movement that is redefining career preparation.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('events')}
              className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              Explore Live Cohorts
            </button>
            <button
              onClick={() => onNavigate('careers')}
              className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-bold text-slate-200 transition cursor-pointer"
            >
              We're Hiring • Join the Team
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
