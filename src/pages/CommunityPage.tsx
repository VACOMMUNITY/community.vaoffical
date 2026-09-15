import { useState, type FormEvent } from 'react';
import { 
  Users, Trophy, Flame, Gift, Sparkles, CheckCircle, 
  Copy, Award, Building2
} from 'lucide-react';
import { db, type CampusAmbassador, type WeeklyChallenge } from '../data/mockDatabase';
import type { NavPage } from '../components/Navbar';

interface CommunityPageProps {
  onNavigate: (page: NavPage) => void;
  currentUser: any;
}

export default function CommunityPage({ onNavigate, currentUser }: CommunityPageProps) {
  const [activeTab, setActiveTab] = useState<'ambassadors' | 'referrals' | 'leaderboard' | 'challenges'>('ambassadors');
  
  // Data
  const ambassadors = db.getAmbassadors();
  const challenges = db.getChallenges();
  const leaderboard = db.getLeaderboard();

  // Ambassador Application Form
  const [collegeName, setCollegeName] = useState('');
  const [city, setCity] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('2nd Year');
  const [motivation, setMotivation] = useState('');
  const [appSubmitted, setAppSubmitted] = useState(false);

  // Referral State
  const [copiedLink, setCopiedLink] = useState(false);
  const referralCode = currentUser ? `VA-${currentUser.name.slice(0, 3).toUpperCase()}${currentUser.id.slice(-3)}` : 'VA-JOIN2026';
  const referralUrl = `https://community-vaofficial.vercel.app/register?ref=${referralCode}`;

  // Challenge Submission
  const [selectedChallenge, setSelectedChallenge] = useState<WeeklyChallenge | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleAmbassadorSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onNavigate('login');
      return;
    }
    const newAmbassador: CampusAmbassador = {
      id: `amb_${Date.now()}`,
      name: currentUser.name,
      college: collegeName,
      city: city,
      avatar: currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      points: 250,
      referralsCount: 0,
      tier: 'Gold',
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    db.saveAmbassadors([newAmbassador, ...ambassadors]);
    setAppSubmitted(true);
  };

  const handleChallengeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onNavigate('login');
      return;
    }
    setChallengeSubmitted(true);
    setTimeout(() => {
      setSelectedChallenge(null);
      setChallengeSubmitted(false);
      setDeliverableUrl('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400 mb-3">
            <Users className="h-3.5 w-3.5" />
            <span>COMMUNITY.VA Growth & Campus Network</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Lead Your Campus. Earn Rewards.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            Join India's most ambitious student network. Become a recognized Campus Lead, compete in weekly soft-skill challenges, refer classmates, and top the national leaderboard.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveTab('ambassadors')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'ambassadors'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Campus Ambassadors</span>
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'referrals'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Gift className="h-4 w-4" />
            <span>Referral Program</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>National Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'challenges'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>Weekly Challenges</span>
          </button>
        </div>

        {/* TAB 1: CAMPUS AMBASSADORS */}
        {activeTab === 'ambassadors' && (
          <div className="space-y-12 animate-fade-in">
            {/* Perks Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 mb-4">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Letter of Recommendation</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Earn an official LOR and Verified Leadership Certificate signed by our executive founding team to supercharge your master's and job applications.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mb-4">
                  <Gift className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Stipends & Free Masterclasses</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Get 100% free access to all premium salary negotiation and public speaking cohorts, plus cash stipends for hosting campus workshops.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400 mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Direct Mentorship & Networking</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Monthly private closed-door advisory circles with CXOs and recruiters hiring for high-growth tech and consulting roles.
                </p>
              </div>
            </div>

            {/* Current Featured Ambassadors */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-white">Top Campus Chapter Leads</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Students driving non-technical transformation in their colleges.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ambassadors.map(amb => (
                  <div key={amb.id} className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <img src={amb.avatar} alt={amb.name} className="h-16 w-16 rounded-full object-cover border-2 border-indigo-500" />
                      <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-slate-950 ${
                        amb.tier === 'Diamond' ? 'bg-cyan-400' : amb.tier === 'Platinum' ? 'bg-purple-300' : 'bg-amber-400'
                      }`}>
                        {amb.tier}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{amb.name}</h4>
                    <span className="text-xs text-indigo-400 font-medium">{amb.college}</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">{amb.city}</span>

                    <div className="mt-4 pt-3 border-t border-white/10 w-full flex justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Referrals</span>
                        <span className="font-bold text-white">{amb.referralsCount} Students</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Growth Points</span>
                        <span className="font-bold text-amber-400">{amb.points}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Box */}
            <div className="p-8 rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-slate-900/80 backdrop-blur-xl max-w-2xl mx-auto shadow-2xl">
              <h3 className="text-2xl font-black text-white text-center">Apply for Your College Chapter</h3>
              <p className="text-xs text-slate-400 text-center mt-1">
                We review applications on a rolling 48-hour basis. Select students receive full onboarding kits.
              </p>

              {appSubmitted ? (
                <div className="mt-6 p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center space-y-2">
                  <CheckCircle className="h-10 w-10 text-green-400 mx-auto" />
                  <h4 className="font-bold text-white text-base">Application Received!</h4>
                  <p className="text-xs text-green-200">
                    Our Campus Growth team will connect via WhatsApp/Email within 48 hours for your introductory screening.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAmbassadorSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">College / University</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. IIT Delhi, BITS Pilani"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">City / State</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Pune, Maharashtra"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Year of Graduation</label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1st Year">1st Year (Fresher)</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year (Pre-Final)</option>
                      <option value="4th Year">4th Year (Final Year)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Why do you want to represent COMMUNITY.VA?</label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="Tell us about student clubs you lead or your motivation to build non-technical skills on campus..."
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-101 cursor-pointer"
                  >
                    Submit Campus Ambassador Application
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REFERRAL PROGRAM */}
        {activeTab === 'referrals' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-slate-900/60 to-slate-900/80 backdrop-blur-xl text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 mx-auto">
                <Gift className="h-8 w-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">Give ₹500, Get ₹500</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                Invite classmates to join COMMUNITY.VA workshops or courses. They get an instant ₹500 off on any pass, and you receive ₹500 in course wallet credits or bank payout.
              </p>

              {/* Referral Link Copy Box */}
              <div className="pt-4 max-w-md mx-auto">
                <div className="flex items-center gap-2 p-2 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
                  <input 
                    type="text" 
                    readOnly 
                    value={referralUrl}
                    className="flex-1 bg-transparent px-3 text-xs font-mono text-purple-300 focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white transition shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 mt-2 block">
                  Your Referral Code: <span className="font-mono font-bold text-white">{referralCode}</span>
                </span>
              </div>
            </div>

            {/* How It Works Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 text-center">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white mx-auto mb-2">1</span>
                <h4 className="font-bold text-xs text-white">Share Your Link</h4>
                <p className="text-[11px] text-slate-400 mt-1">Send to WhatsApp college groups, LinkedIn peers, or hostel mates.</p>
              </div>
              <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 text-center">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white mx-auto mb-2">2</span>
                <h4 className="font-bold text-xs text-white">Friend Enrolls</h4>
                <p className="text-[11px] text-slate-400 mt-1">They use your link or code and get ₹500 off instantly at checkout.</p>
              </div>
              <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 text-center">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white mx-auto mb-2">3</span>
                <h4 className="font-bold text-xs text-white">Unlock Cash & Badges</h4>
                <p className="text-[11px] text-slate-400 mt-1">Earn ₹500 reward and move up the national campus leaderboard.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <span>All-India Student Leaderboard</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Rankings refreshed every Sunday at midnight.</p>
                </div>
                <span className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
                  Season 3: Active
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {leaderboard.map(item => (
                  <div key={item.rank} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs ${
                        item.rank === 1 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' :
                        item.rank === 2 ? 'bg-slate-300 text-slate-950' :
                        item.rank === 3 ? 'bg-amber-700 text-white' :
                        'bg-white/5 text-slate-400'
                      }`}>
                        #{item.rank}
                      </span>
                      <img src={item.avatar} alt={item.name} className="h-10 w-10 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          <span className="text-[10px] rounded bg-white/10 px-1.5 py-0.5 text-slate-300 font-semibold">{item.badge}</span>
                        </h4>
                        <span className="text-[11px] text-slate-400">{item.college}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sm text-amber-400 block">{item.points} pts</span>
                      <span className="text-[10px] text-slate-500">Growth Score</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WEEKLY CHALLENGES */}
        {activeTab === 'challenges' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {challenges.map(ch => (
                <div key={ch.id} className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[10px] font-extrabold text-emerald-400 uppercase">
                        {ch.tag}
                      </span>
                      <span className="text-xs font-bold text-amber-400">+{ch.points} pts</span>
                    </div>
                    <h4 className="text-base font-extrabold text-white leading-snug">{ch.title}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{ch.description}</p>
                    
                    <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 space-y-1">
                      <div>Deadline: <span className="text-white font-semibold">{ch.deadline}</span></div>
                      <div>Participants: <span className="text-white font-semibold">{ch.participantsCount} Students</span></div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedChallenge(ch)}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 text-xs font-bold text-white transition shadow-md cursor-pointer"
                  >
                    Submit Challenge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Challenge Submission Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase">{selectedChallenge.tag}</span>
                <h3 className="text-lg font-black text-white mt-1">{selectedChallenge.title}</h3>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedChallenge.description}</p>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Required Deliverable:</span>
              <span className="font-semibold text-white">{selectedChallenge.deliverable}</span>
            </div>

            {challengeSubmitted ? (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center space-y-1">
                <CheckCircle className="h-6 w-6 text-green-400 mx-auto" />
                <span className="text-xs font-bold text-white block">Deliverable Submitted!</span>
                <span className="text-[11px] text-green-300">Points will be added to your profile after peer review.</span>
              </div>
            ) : (
              <form onSubmit={handleChallengeSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Link to Your Submission</label>
                  <input
                    type="url"
                    required
                    placeholder="https://loom.com/... or Google Drive Link"
                    value={deliverableUrl}
                    onChange={(e) => setDeliverableUrl(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChallenge(null)}
                    className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-bold text-slate-400 hover:bg-white/5 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                  >
                    Confirm Submission
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
