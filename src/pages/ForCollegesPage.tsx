import { useState, type FormEvent } from 'react';
import { 
  Building2, CheckCircle, ArrowRight, Download, Users, Award, FileText
} from 'lucide-react';
import { db, type CollegePartner } from '../data/mockDatabase';
import type { NavPage } from '../components/Navbar';

interface ForCollegesPageProps {
  onNavigate?: (page: NavPage) => void;
}

export default function ForCollegesPage({ onNavigate }: ForCollegesPageProps) {
  const partners: CollegePartner[] = db.getCollegePartners();

  const [institutionName, setInstitutionName] = useState('');
  const [tpoName, setTpoName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentCount, setStudentCount] = useState('200 - 500 Students');
  const [interestType, setInterestType] = useState('Campus Placement Readiness Bootcamp');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleDownloadBrochure = () => {
    const content = `COMMUNITY.VA — Institutional Partnership & Campus Readiness Brochure 2026\n\nPrograms Offered:\n1. 2-Day Placement Acceleration Bootcamp (ATS Resume, STAR Mock Interviews, Salary Negotiation)\n2. Corporate Communication & Executive Presence Cohort\n3. Leadership & Cross-Functional Team Dynamics\n\nMetrics:\n- 25,000+ Students Upskilled\n- 45+ Partner Institutions\n- 94% Interview Confidence Rating\n\nHeadquarters: Hyderabad, Telangana, India\nContact: foundercommunityva@gmail.com | community.va01@gmail.com\nWhatsApp / Phone: +91 7416201359`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'COMMUNITY_VA_College_Partnership_Brochure.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400 mb-4">
            <Building2 className="h-3.5 w-3.5" />
            <span>Institutional Alliances & Placement Cells</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Elevate Your College’s Placement Conversion Rate
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Engineering and degree colleges teach technical fundamentals. COMMUNITY.VA equips your students with the human skills recruiters demand: behavioral articulation, interview resilience, and professional polish.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('mou-form');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              <span>Request Campus MOU</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={handleDownloadBrochure}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-slate-200 transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-blue-400" />
              <span>Download Institutional Deck</span>
            </button>
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-center">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">94%</span>
            <span className="text-xs text-slate-400 block mt-1 font-semibold">Placement Confidence Lift</span>
          </div>
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-center">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">45+</span>
            <span className="text-xs text-slate-400 block mt-1 font-semibold">Campus Chapters Active</span>
          </div>
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-center">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">25,000+</span>
            <span className="text-xs text-slate-400 block mt-1 font-semibold">Students Certified</span>
          </div>
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-center">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">1.8x</span>
            <span className="text-xs text-slate-400 block mt-1 font-semibold">Average Offer Quality</span>
          </div>
        </div>

        {/* What We Deliver to Colleges */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">How We Partner with Your University</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Comprehensive turnkey workshops delivered online or physically on campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">ATS Resume & LinkedIn Audits</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every enrolled student gets automated ATS score benchmarking and 1-on-1 feedback on quantifiable impact statements and bullet point structuring.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">Live Behavioral Mock Drives</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Industry leaders simulate high-stress panel interviews, situational judgment tests, and behavioral STAR questions with personalized scorecards.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">Verifiable Certifications</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Students receive tamper-proof cryptographic digital certificates with QR verification, validating workplace readiness directly to prospective employers.
              </p>
            </div>
          </div>
        </div>

        {/* Partner Institutions Grid */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-xl font-black text-white">Leading Partner Universities</h3>
            <p className="text-xs text-slate-400 mt-1">Institutions where COMMUNITY.VA has hosted campus bootcamps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map(col => (
              <div key={col.id} className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{col.logo}</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">{col.shortName}</h4>
                    <span className="text-[11px] text-slate-400">{col.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-400">{col.studentsTrained}+</span>
                  <span className="text-[10px] text-slate-500 block">Trained</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional MOU / Partnership Booking Form */}
        <div id="mou-form" className="p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-slate-900/90 backdrop-blur-xl max-w-2xl mx-auto shadow-2xl">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-white">Request College Partnership MOU</h3>
            <p className="text-xs text-slate-400 mt-1">
              Connect with our Institutional Relations Director for a custom campus workshop proposal.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center space-y-2">
              <CheckCircle className="h-10 w-10 text-green-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Partnership Request Received!</h4>
              <p className="text-xs text-green-200">
                Thank you. Our Institutional Director will reach out to your Training & Placement cell within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Institute of Technology, Trichy"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">TPO / Dean / Representative Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Prof. / Dr. / Mr. Name"
                    value={tpoName}
                    onChange={(e) => setTpoName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Official College Email</label>
                  <input
                    type="email"
                    required
                    placeholder="tpo@college.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 74162 01359"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Expected Batch Size</label>
                  <select
                    value={studentCount}
                    onChange={(e) => setStudentCount(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Under 100 Students">Under 100 Students</option>
                    <option value="200 - 500 Students">200 - 500 Students</option>
                    <option value="500 - 1500 Students">500 - 1500 Students</option>
                    <option value="1500+ Campus-Wide">1500+ Campus-Wide</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Preferred Program</label>
                <select
                  value={interestType}
                  onChange={(e) => setInterestType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Campus Placement Readiness Bootcamp">2-Day Placement Readiness Bootcamp</option>
                  <option value="Institutional Soft Skills MOU">Semester-Long Institutional MOU</option>
                  <option value="ATS Resume & Mock Interview Drive">Comprehensive ATS & Mock Interview Drive</option>
                  <option value="Leadership & Public Speaking Clinic">Executive Presence & Public Speaking Clinic</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-101 cursor-pointer"
              >
                Submit Institutional Partnership Request
              </button>
            </form>
          )}
        </div>

        {onNavigate && (
          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('community')}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              Are you a student? <span className="text-indigo-400 font-bold underline">Apply for Campus Ambassador instead</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
